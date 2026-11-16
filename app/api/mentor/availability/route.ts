/**
 * GET  /api/mentor/availability          — get current mentor's availability
 * POST /api/mentor/availability          — set availability (replaces all)
 * GET  /api/mentor/availability?mentorId — get a specific mentor's availability (public)
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const slotSchema = z.object({
  dayOfWeek: z.enum(["MON","TUE","WED","THU","FRI","SAT","SUN"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime:   z.string().regex(/^\d{2}:\d{2}$/),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mentorId = searchParams.get("mentorId");

    if (mentorId) {
      // Public — for booking page
      const slots = await prisma.mentorAvailability.findMany({
        where: { mentorId },
        orderBy: { dayOfWeek: "asc" },
      });
      const blocked = await prisma.mentorBlockedDate.findMany({
        where: { mentorId, date: { gte: new Date() } },
        select: { date: true },
      });
      return NextResponse.json({ slots, blocked });
    }

    // Authenticated — mentor's own
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const mentor = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
    if (!mentor) return NextResponse.json({ slots: [], blocked: [] });

    const slots = await prisma.mentorAvailability.findMany({
      where: { mentorId: mentor.id },
      orderBy: { dayOfWeek: "asc" },
    });
    const blocked = await prisma.mentorBlockedDate.findMany({
      where: { mentorId: mentor.id, date: { gte: new Date() } },
      select: { date: true, reason: true },
    });

    return NextResponse.json({ slots, blocked });
  } catch (error) {
    console.error("[availability] GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const mentor = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
    if (!mentor || mentor.status !== "APPROVED") {
      return NextResponse.json({ error: "Not an approved mentor" }, { status: 403 });
    }

    const { slots, blockedDates } = await req.json() as {
      slots: z.infer<typeof slotSchema>[];
      blockedDates?: { date: string; reason?: string }[];
    };

    const parsedSlots = z.array(slotSchema).safeParse(slots);
    if (!parsedSlots.success) {
      return NextResponse.json({ error: "Invalid slots", details: parsedSlots.error.flatten() }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Replace availability
      await tx.mentorAvailability.deleteMany({ where: { mentorId: mentor.id } });
      if (parsedSlots.data.length > 0) {
        await tx.mentorAvailability.createMany({
          data: parsedSlots.data.map((s) => ({ mentorId: mentor.id, ...s })),
        });
      }
      // Replace future blocked dates if provided
      if (blockedDates) {
        await tx.mentorBlockedDate.deleteMany({
          where: { mentorId: mentor.id, date: { gte: new Date() } },
        });
        if (blockedDates.length > 0) {
          await tx.mentorBlockedDate.createMany({
            data: blockedDates.map((b) => ({
              mentorId: mentor.id,
              date: new Date(b.date),
              reason: b.reason ?? null,
            })),
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[availability] POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
