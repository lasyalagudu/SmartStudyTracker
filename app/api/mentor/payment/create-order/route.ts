/**
 * POST /api/mentor/payment/create-order
 * Creates a Razorpay order for a PENDING_PAYMENT booking.
 * Returns the Razorpay order so the client can open the Razorpay checkout.
 *
 * Required env vars:
 *   RAZORPAY_KEY_ID       — from Razorpay Dashboard > Settings > API Keys
 *   RAZORPAY_KEY_SECRET   — keep secret, never expose to client
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function createRazorpayOrder(amountInPaise: number, bookingId: string) {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  const body = JSON.stringify({
    amount:   amountInPaise,
    currency: "INR",
    receipt:  `booking_${bookingId}`,
    notes:    { bookingId },
  });

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  return fetch("https://api.razorpay.com/v1/orders", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Basic ${auth}`,
    },
    body,
  }).then((r) => r.json());
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { bookingId } = await req.json() as { bookingId: string };
    if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

    const booking = await prisma.mentorBooking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking || booking.studentId !== user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ error: "Booking is not awaiting payment" }, { status: 400 });
    }

    // Reuse existing order if one was already created
    if (booking.payment?.razorpayOrderId) {
      return NextResponse.json({
        orderId:   booking.payment.razorpayOrderId,
        amount:    booking.amountInPaise,
        currency:  "INR",
        keyId:     process.env.RAZORPAY_KEY_ID,
        bookingId: booking.id,
      });
    }

    // Free session (₹0) — skip payment flow
    if (booking.amountInPaise === 0) {
      await prisma.mentorBooking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });
      return NextResponse.json({ free: true, bookingId });
    }

    const rzpOrder = await createRazorpayOrder(booking.amountInPaise, bookingId);

    if (!rzpOrder.id) {
      console.error("[create-order] Razorpay error:", rzpOrder);
      return NextResponse.json({ error: "Payment provider error" }, { status: 502 });
    }

    // Persist payment record
    await prisma.mentorPayment.create({
      data: {
        bookingId:        bookingId,
        razorpayOrderId:  rzpOrder.id,
        amountInPaise:    booking.amountInPaise,
        currency:         "INR",
        status:           "CREATED",
      },
    });

    return NextResponse.json({
      orderId:   rzpOrder.id,
      amount:    booking.amountInPaise,
      currency:  "INR",
      keyId:     process.env.RAZORPAY_KEY_ID,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("[create-order] error:", error);
    const msg = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
