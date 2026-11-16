/**
 * GET  /api/mentor/bookings   — student's own bookings
 * POST /api/mentor/bookings   — create a booking (PENDING_PAYMENT)
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isSlotConflict } from "@/lib/mentorUtils";

const createBookingSchema = z.object({
  mentorId:    z.string().uuid(),
  sessionId:   z.string().uuid(),
  scheduledAt: z.string().datetime(),
  studentNote: z.string().max(500).optional().nullable(),
});

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ bookings: [] });

    const bookings = await prisma.mentorBooking.findMany({
      where: { studentId: user.id },
      orderBy: { scheduledAt: "desc" },
      include: {
        mentor: {
          select: {
            id: true, headline: true, photoUrl: true, primaryExam: true,
            user: { select: { name: true } },
          },
        },
        session: { select: { title: true, durationMins: true } },
        payment: { select: { status: true } },
        review:  { select: { id: true, rating: true } },
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("[bookings] GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const { mentorId, sessionId, scheduledAt, studentNote } = parsed.data;

    // Load mentor + session
    const [mentor, session] = await Promise.all([
      prisma.mentorProfile.findUnique({ where: { id: mentorId } }),
      prisma.mentorSession.findFirst({ where: { id: sessionId, mentorId, isActive: true } }),
    ]);

    if (!mentor || mentor.status !== "APPROVED") {
      return NextResponse.json({ error: "Mentor not available" }, { status: 404 });
    }
    if (!session) {
      return NextResponse.json({ error: "Session not available" }, { status: 404 });
    }

    // Prevent student booking their own profile
    if (mentor.userId === user.id) {
      return NextResponse.json({ error: "Cannot book your own profile" }, { status: 400 });
    }

    const slotStart = new Date(scheduledAt);

    // Server-side conflict check — load existing confirmed bookings for that mentor
    const existingBookings = await prisma.mentorBooking.findMany({
      where: {
        mentorId,
        status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
        scheduledAt: {
          gte: new Date(slotStart.getTime() - 12 * 3600 * 1000),
          lte: new Date(slotStart.getTime() + 12 * 3600 * 1000),
        },
      },
      select: { scheduledAt: true, durationMins: true, status: true },
    });

    if (isSlotConflict(slotStart, session.durationMins, existingBookings)) {
      return NextResponse.json({ error: "This slot is no longer available" }, { status: 409 });
    }

    // Check blocked dates
    const dateOnly = new Date(slotStart);
    dateOnly.setHours(0, 0, 0, 0);
    const isBlocked = await prisma.mentorBlockedDate.findFirst({
      where: { mentorId, date: dateOnly },
    });
    if (isBlocked) {
      return NextResponse.json({ error: "Mentor is unavailable on this date" }, { status: 409 });
    }

    const booking = await prisma.mentorBooking.create({
      data: {
        studentId:    user.id,
        mentorId,
        sessionId,
        scheduledAt:  slotStart,
        durationMins: session.durationMins,
        status:       "PENDING_PAYMENT",
        amountInPaise: session.priceInPaise,
        studentNote:  studentNote ?? null,
      },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("[bookings] POST error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
