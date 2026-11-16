/**
 * GET  /api/mentor/me  — fetch the current user's mentor profile (full detail)
 * PATCH /api/mentor/me — update profile fields (approved mentors only editing non-status fields)
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ mentor: null });

    const mentor = await prisma.mentorProfile.findUnique({
      where: { userId: user.id },
      include: {
        exams:        { orderBy: { examYear: "desc" } },
        achievements: { orderBy: { createdAt: "desc" } },
        sessions:     { orderBy: { priceInPaise: "asc" } },
        availability: { orderBy: { dayOfWeek: "asc" } },
        blockedDates: { orderBy: { date: "asc" }, where: { date: { gte: new Date() } } },
        reviews:      { orderBy: { createdAt: "desc" }, take: 20, include: { student: { select: { name: true } } } },
        bookings: {
          orderBy: { scheduledAt: "desc" },
          take: 20,
          include: {
            student: { select: { name: true, email: true } },
            session: { select: { title: true, durationMins: true } },
            payment: { select: { status: true, amountInPaise: true } },
          },
        },
      },
    });

    return NextResponse.json({ mentor });
  } catch (error) {
    console.error("[mentor/me] GET error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const mentor = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
    if (!mentor) return NextResponse.json({ error: "No mentor profile" }, { status: 404 });

    const body = await req.json();
    // Only allow safe fields — never allow status/adminNote from client
    const { headline, about, photoUrl, college, languages, experienceYears, linkedinUrl } = body;

    const updated = await prisma.mentorProfile.update({
      where: { id: mentor.id },
      data: {
        ...(headline        != null ? { headline }        : {}),
        ...(about           != null ? { about }           : {}),
        ...(photoUrl        != null ? { photoUrl }        : {}),
        ...(college         != null ? { college }         : {}),
        ...(languages       != null ? { languages }       : {}),
        ...(experienceYears != null ? { experienceYears } : {}),
        ...(linkedinUrl     != null ? { linkedinUrl }     : {}),
      },
    });

    return NextResponse.json({ success: true, mentor: updated });
  } catch (error) {
    console.error("[mentor/me] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
