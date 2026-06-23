import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateNextStreak } from "@/lib/streak";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkUser.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    const session = await prisma.timerSession.create({
      data: {
        userId: user.id,
        subjectId: body.subjectId || null,
        durationMinutes: body.durationMinutes,
        sessionType: body.sessionType,
        completed: body.completed ?? true,
        startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
        endedAt: body.endedAt ? new Date(body.endedAt) : null,
      },
    });
    if (body.completed === true && body.sessionType === "FOCUS") {
  const nextStreak = calculateNextStreak(
    user.streakCount,
    user.lastStudyDate
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      streakCount: nextStreak.streakCount,
      lastStudyDate: nextStreak.lastStudyDate,
    },
  });
}

    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}