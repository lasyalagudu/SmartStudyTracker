/**
 * POST /api/mentor/payment/webhook
 * Razorpay webhook handler — receives payment events and keeps DB in sync.
 * Configure in Razorpay Dashboard: Settings > Webhooks → add this URL.
 *
 * Required env var:  RAZORPAY_WEBHOOK_SECRET
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody   = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[webhook] RAZORPAY_WEBHOOK_SECRET not set");
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    // Verify webhook signature
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSig !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload: {
        payment?: { entity: { id: string; order_id: string; status: string } };
        order?:   { entity: { id: string; status: string; notes: { bookingId?: string } } };
      };
    };

    const orderId  = event.payload.payment?.entity.order_id
                   ?? event.payload.order?.entity.id;
    const bookingId = event.payload.order?.entity.notes?.bookingId;

    if (!orderId) return NextResponse.json({ received: true });

    // Find payment record
    const payment = await prisma.mentorPayment.findUnique({
      where: { razorpayOrderId: orderId },
    });

    switch (event.event) {
      case "payment.captured": {
        const paymentId = event.payload.payment?.entity.id;
        if (payment && paymentId) {
          await prisma.mentorPayment.update({
            where: { razorpayOrderId: orderId },
            data: { razorpayPaymentId: paymentId, status: "CAPTURED", webhookPayload: rawBody },
          });
          if (payment.bookingId) {
            await prisma.mentorBooking.update({
              where: { id: payment.bookingId },
              data: { status: "CONFIRMED" },
            });
          }
        }
        break;
      }
      case "payment.failed": {
        if (payment) {
          await prisma.mentorPayment.update({
            where: { razorpayOrderId: orderId },
            data: { status: "FAILED", webhookPayload: rawBody },
          });
          await prisma.mentorBooking.update({
            where: { id: payment.bookingId },
            data: { status: "PAYMENT_FAILED" },
          });
        }
        break;
      }
      case "refund.created": {
        if (payment) {
          await prisma.mentorPayment.update({
            where: { razorpayOrderId: orderId },
            data: { status: "REFUNDED", webhookPayload: rawBody },
          });
          await prisma.mentorBooking.update({
            where: { id: payment.bookingId },
            data: { status: "REFUNDED" },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
