import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function GET() {
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
      include: {
        subjects: {
          include: {
            topics: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    const today = new Date();

    const weekStart = startOfDay(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    const weekEnd = endOfDay(new Date(weekStart));
    weekEnd.setDate(weekStart.getDate() + 6);

    const heatmapStart = startOfDay(new Date(weekStart));
    heatmapStart.setDate(weekStart.getDate() - 77);

    const sessions = await prisma.timerSession.findMany({
      where: {
        userId: user.id,
        examId: activeExam?.id, // NEW
        completed: true,
        sessionType: "FOCUS",
        startedAt: {
          gte: heatmapStart,
          lte: weekEnd,
        },
      },
      include: {
        subject: true,
      },
      orderBy: {
        startedAt: "asc",
      },
    });

    const totalMinutes = sessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0,
    );

    const weeklyMinutes = Array(7).fill(0);

    sessions.forEach((session) => {
      if (session.startedAt >= weekStart && session.startedAt <= weekEnd) {
        const jsDay = session.startedAt.getDay();
        const index = jsDay === 0 ? 6 : jsDay - 1;
        weeklyMinutes[index] += session.durationMinutes;
      }
    });

    const heatmapDays = [];

    for (let i = 0; i < 84; i++) {
      const date = startOfDay(new Date(heatmapStart));
      date.setDate(heatmapStart.getDate() + i);

      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const minutes = sessions
        .filter(
          (session) =>
            session.startedAt >= dayStart && session.startedAt <= dayEnd,
        )
        .reduce((sum, session) => sum + session.durationMinutes, 0);

      heatmapDays.push({
        date: dayStart.toISOString().split("T")[0],
        minutes,
      });
    }

    const activeDays = heatmapDays.filter((day) => day.minutes > 0).length;

    const bestDayIndex = weeklyMinutes.indexOf(Math.max(...weeklyMinutes));
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const bestStudyDay = weekDays[bestDayIndex];

    return NextResponse.json({
      subjects: activeExam?.subjects ?? [],
      totalSessions: sessions.length,
      totalMinutes,
      weeklyMinutes,
      heatmapDays,
      activeDays,
      bestStudyDay,
      streakCount: user.streakCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analytics failed" },
      { status: 500 },
    );
  }
}
