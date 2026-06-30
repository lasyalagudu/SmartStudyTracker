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
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activeExam = await prisma.exam.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    if (!activeExam) {
      return NextResponse.json(
        { error: "No active exam found" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.durationMinutes || body.durationMinutes <= 0) {
      return NextResponse.json(
        { error: "Duration is required" },
        { status: 400 }
      );
    }

    const completed = body.completed ?? true;
    const sessionType = body.sessionType ?? "FOCUS";

    const session = await prisma.timerSession.create({
      data: {
        userId: user.id,
        examId: activeExam.id,
        subjectId: body.subjectId || null,
        topicId: body.topicId || null,
        durationMinutes: body.durationMinutes,
        sessionType,
        completed,
        startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
        endedAt: body.endedAt ? new Date(body.endedAt) : new Date(),
      },
    });

    let updatedStreak = user.streakCount;

    if (completed === true && sessionType === "FOCUS") {
      const nextStreak = calculateNextStreak(
        user.streakCount,
        user.lastStudyDate
      );

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          streakCount: nextStreak.streakCount,
          lastStudyDate: nextStreak.lastStudyDate,
        },
      });

      updatedStreak = updatedUser.streakCount;
    }

    return NextResponse.json({
      session,
      streak: updatedStreak,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}