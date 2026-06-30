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

    const { durationMinutes, subjectId, topicId } = await req.json();

    if (!durationMinutes || durationMinutes <= 0) {
      return NextResponse.json(
        { error: "Study time is required" },
        { status: 400 }
      );
    }

    const now = new Date();

    const session = await prisma.timerSession.create({
      data: {
        userId: user.id,
        examId: activeExam.id,
        subjectId: subjectId || null,
        topicId: topicId || null,
        durationMinutes,
        sessionType: "FOCUS",
        completed: true,
        startedAt: now,
        endedAt: now,
      },
    });

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

    return NextResponse.json({
      success: true,
      session,
      streak: updatedUser.streakCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to log study" },
      { status: 500 }
    );
  }
}