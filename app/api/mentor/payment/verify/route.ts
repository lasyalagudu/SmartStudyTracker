/**
 * POST /api/mentor/payment/verify
 * Verifies Razorpay payment signature server-side and confirms the booking.
 * Never trust the client's payment success alone.
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } =
      await req.json() as {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        bookingId: string;
      };

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingId) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
    }

    const expectedSig = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSig !== razorpaySignature) {
      // Mark payment as failed
      await prisma.mentorPayment.updateMany({
        where: { razorpayOrderId },
        data: { status: "FAILED" },
      });
      await prisma.mentorBooking.updateMany({
        where: { id: bookingId, studentId: user.id },
        data: { status: "PAYMENT_FAILED" },
      });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Payment genuine — confirm booking in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.mentorPayment.updateMany({
        where: { razorpayOrderId },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: "CAPTURED",
        },
      });
      await tx.mentorBooking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });
    });

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error("[payment/verify] error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
