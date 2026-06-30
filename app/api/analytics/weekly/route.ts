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

function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0];
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

    if (!activeExam) {
      return NextResponse.json(
        { error: "No active exam found" },
        { status: 400 }
      );
    }

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
        examId: activeExam.id,
        completed: true,
        sessionType: "FOCUS",
        startedAt: {
          gte: heatmapStart,
          lte: weekEnd,
        },
      },
      include: {
        subject: true,
        topic: true,
      },
      orderBy: {
        startedAt: "asc",
      },
    });

    const weeklySessions = sessions.filter(
      (session) => session.startedAt >= weekStart && session.startedAt <= weekEnd
    );

    const weeklyMinutes = Array(7).fill(0);

    weeklySessions.forEach((session) => {
      const jsDay = session.startedAt.getDay();
      const index = jsDay === 0 ? 6 : jsDay - 1;
      weeklyMinutes[index] += session.durationMinutes;
    });

    const totalMinutes = weeklySessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0
    );

    const totalSessions = weeklySessions.length;
    const averageDailyMinutes = Math.round(totalMinutes / 7);

    const weeklyGoalMinutes = (user.dailyStudyGoalMinutes ?? 360) * 7;

    const weeklyGoalPercent =
      weeklyGoalMinutes > 0
        ? Math.min(100, Math.round((totalMinutes / weeklyGoalMinutes) * 100))
        : 0;

    const activeStudyDays = weeklyMinutes.filter((m) => m > 0).length;
    const consistency = Math.round((activeStudyDays / 7) * 100);

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const bestDayIndex = weeklyMinutes.indexOf(Math.max(...weeklyMinutes));
    const bestStudyDay =
      weeklyMinutes[bestDayIndex] > 0 ? weekDays[bestDayIndex] : "Not yet";

    const subjectStudyMap = new Map<
      string,
      {
        id: string;
        name: string;
        color: string;
        minutes: number;
      }
    >();

    weeklySessions.forEach((session) => {
      if (!session.subject) return;

      if (!subjectStudyMap.has(session.subject.id)) {
        subjectStudyMap.set(session.subject.id, {
          id: session.subject.id,
          name: session.subject.name,
          color: session.subject.color,
          minutes: 0,
        });
      }

      subjectStudyMap.get(session.subject.id)!.minutes +=
        session.durationMinutes;
    });

    const subjectStudyTime = Array.from(subjectStudyMap.values()).sort(
      (a, b) => b.minutes - a.minutes
    );

    const strongSubject = subjectStudyTime[0] ?? null;
    const weakSubject =
      subjectStudyTime.length > 0
        ? [...subjectStudyTime].sort((a, b) => a.minutes - b.minutes)[0]
        : null;

    const subjectProgress = activeExam.subjects.map((subject) => {
      const totalTopics = subject.topics?.length ?? 0;
      const completedTopics =
        subject.topics?.filter(
          (topic) => topic.status === "COMPLETED" || topic.mastered
        ).length ?? 0;

      const progress =
        totalTopics > 0
          ? Math.round((completedTopics / totalTopics) * 100)
          : 0;

      const studyData = subjectStudyMap.get(subject.id);

      return {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        totalTopics,
        completedTopics,
        progress,
        minutes: studyData?.minutes ?? 0,
      };
    });

    const totalTopics = activeExam.subjects.reduce(
      (sum, subject) => sum + (subject.topics?.length ?? 0),
      0
    );

    const completedTopics = activeExam.subjects.reduce(
      (sum, subject) =>
        sum +
        (subject.topics?.filter(
          (topic) => topic.status === "COMPLETED" || topic.mastered
        ).length ?? 0),
      0
    );

    const overallProgress =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const heatmapDays = [];

    for (let i = 0; i < 84; i++) {
      const date = startOfDay(new Date(heatmapStart));
      date.setDate(heatmapStart.getDate() + i);

      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const minutes = sessions
        .filter(
          (session) =>
            session.startedAt >= dayStart && session.startedAt <= dayEnd
        )
        .reduce((sum, session) => sum + session.durationMinutes, 0);

      heatmapDays.push({
        date: formatDateKey(dayStart),
        minutes,
      });
    }

    let insight = "";

    if (totalMinutes === 0) {
      insight =
        "No study sessions recorded this week yet. Start one focus session today to build momentum.";
    } else if (weeklyGoalPercent >= 100) {
      insight =
        "Excellent! You have completed your weekly study goal. Use the remaining time for revision or weak topics.";
    } else if (weeklyGoalPercent >= 70) {
      insight =
        "You're close to your weekly goal. One or two focused sessions can help you finish strong.";
    } else if (consistency < 40) {
      insight =
        "Your consistency is low this week. Try studying at least once today to protect your routine.";
    } else {
      insight =
        "You are behind your weekly goal. Focus on one important subject today and complete a focused session.";
    }

    return NextResponse.json({
      exam: {
        id: activeExam.id,
        name: activeExam.name,
        targetDate: activeExam.targetDate,
      },

      range: {
        weekStart: formatDateKey(weekStart),
        weekEnd: formatDateKey(weekEnd),
      },

      stats: {
        totalMinutes,
        totalSessions,
        averageDailyMinutes,
        weeklyGoalMinutes,
        weeklyGoalPercent,
        activeStudyDays,
        consistency,
        bestStudyDay,
        streakCount: user.streakCount,
        overallProgress,
        totalTopics,
        completedTopics,
      },

      weeklyMinutes,
      heatmapDays,
      subjectProgress,
      subjectStudyTime,
      strongSubject,
      weakSubject,
      insight,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Weekly analytics failed",
      },
      { status: 500 }
    );
  }
}