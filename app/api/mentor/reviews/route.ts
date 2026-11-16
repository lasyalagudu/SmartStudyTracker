/**
 * POST /api/mentor/reviews
 * Student leaves a review after a COMPLETED booking (one review per booking).
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().max(1000).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const { bookingId, rating, comment } = parsed.data;

    const booking = await prisma.mentorBooking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking || booking.studentId !== user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.status !== "COMPLETED") {
      return NextResponse.json({ error: "Can only review completed sessions" }, { status: 400 });
    }
    if (booking.review) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
    }

    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.mentorReview.create({
        data: {
          bookingId,
          studentId: user.id,
          mentorId:  booking.mentorId,
          rating,
          comment: comment ?? null,
        },
      });

      // Recompute mentor avg rating
      const agg = await tx.mentorReview.aggregate({
        where:   { mentorId: booking.mentorId },
        _avg:    { rating: true },
        _count:  { rating: true },
      });

      await tx.mentorProfile.update({
        where: { id: booking.mentorId },
        data: {
          avgRating:    Math.round((agg._avg.rating ?? 0) * 10) / 10,
          totalReviews: agg._count.rating,
        },
      });

      return r;
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("[reviews] POST error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
