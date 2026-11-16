/**
 * GET   /api/mentor/bookings/[bookingId]  — get single booking (student or mentor)
 * PATCH /api/mentor/bookings/[bookingId]  — update status / meeting URL (mentor only for some fields)
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { bookingId } = await params;

    const booking = await prisma.mentorBooking.findUnique({
      where: { id: bookingId },
      include: {
        student: { select: { name: true, email: true } },
        mentor:  { select: { id: true, headline: true, photoUrl: true, user: { select: { name: true } } } },
        session: true,
        payment: true,
        review:  true,
      },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Only student or the mentor's user can view
    const mentorUser = await prisma.mentorProfile.findUnique({
      where: { id: booking.mentorId }, select: { userId: true }
    });
    if (booking.studentId !== user.id && mentorUser?.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("[bookings/[id]] GET:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { bookingId } = await params;
    const booking = await prisma.mentorBooking.findUnique({ where: { id: bookingId } });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
    const isMentor  = mentorProfile?.id === booking.mentorId;
    const isStudent = booking.studentId === user.id;

    if (!isMentor && !isStudent) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    // Mentor can set meetingUrl, mentorNote, and mark COMPLETED
    if (isMentor) {
      if (body.meetingUrl   != null) updateData.meetingUrl  = body.meetingUrl;
      if (body.mentorNote   != null) updateData.mentorNote  = body.mentorNote;
      if (body.status === "COMPLETED" && booking.status === "CONFIRMED") {
        updateData.status = "COMPLETED";
        // Update mentor stats
        await prisma.mentorProfile.update({
          where: { id: booking.mentorId },
          data: {
            totalSessions: { increment: 1 },
            totalEarnings: { increment: booking.amountInPaise },
          },
        });
      }
      if (body.status === "CANCELLED" && !["COMPLETED","REFUNDED"].includes(booking.status)) {
        updateData.status = "CANCELLED";
      }
    }

    // Student can cancel if PENDING_PAYMENT or CONFIRMED
    if (isStudent && body.status === "CANCELLED") {
      if (["PENDING_PAYMENT","CONFIRMED"].includes(booking.status)) {
        updateData.status = "CANCELLED";
      } else {
        return NextResponse.json({ error: "Cannot cancel at this stage" }, { status: 400 });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.mentorBooking.update({
      where: { id: bookingId },
      data: updateData,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("[bookings/[id]] PATCH:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
