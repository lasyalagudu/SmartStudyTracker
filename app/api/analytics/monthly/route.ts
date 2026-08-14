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

function getMonthRange(year: number, month: number) {
  const start = startOfDay(new Date(year, month - 1, 1));
  const end = endOfDay(new Date(year, month, 0));
  return { start, end };
}

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const today = new Date();

    const year = Number(url.searchParams.get("year")) || today.getFullYear();
    const month = Number(url.searchParams.get("month")) || today.getMonth() + 1;

    const { start: monthStart, end: monthEnd } = getMonthRange(year, month);

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

    const sessions = await prisma.timerSession.findMany({
      where: {
        userId: user.id,
        examId: activeExam.id,
        completed: true,
        sessionType: "FOCUS",
        startedAt: {
          gte: monthStart,
          lte: monthEnd,
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

    const previousMonthDate = new Date(year, month - 2, 1);
    const previousYear = previousMonthDate.getFullYear();
    const previousMonth = previousMonthDate.getMonth() + 1;
    const { start: prevStart, end: prevEnd } = getMonthRange(
      previousYear,
      previousMonth
    );

    const previousSessions = await prisma.timerSession.findMany({
      where: {
        userId: user.id,
        examId: activeExam.id,
        completed: true,
        sessionType: "FOCUS",
        startedAt: {
          gte: prevStart,
          lte: prevEnd,
        },
      },
    });

    const totalMinutes = sessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0
    );

    const totalSessions = sessions.length;

    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMinutes = Array(daysInMonth).fill(0);

    sessions.forEach((session) => {
      const day = session.startedAt.getDate();
      dailyMinutes[day - 1] += session.durationMinutes;
    });

    const weeklyTrend = [0, 0, 0, 0, 0];

    sessions.forEach((session) => {
      const day = session.startedAt.getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 4);
      weeklyTrend[weekIndex] += session.durationMinutes;
    });

    const activeStudyDays = dailyMinutes.filter((m) => m > 0).length;
    const consistency =
      daysInMonth > 0 ? Math.round((activeStudyDays / daysInMonth) * 100) : 0;

    const monthlyGoalMinutes =
      (user.dailyStudyGoalMinutes ?? 360) * daysInMonth;

    const monthlyGoalPercent =
      monthlyGoalMinutes > 0
        ? Math.min(100, Math.round((totalMinutes / monthlyGoalMinutes) * 100))
        : 0;

    const subjectMap = new Map<
      string,
      {
        id: string;
        name: string;
        color: string;
        minutes: number;
        sessions: number;
      }
    >();

    sessions.forEach((session) => {
      if (!session.subject) return;

      if (!subjectMap.has(session.subject.id)) {
        subjectMap.set(session.subject.id, {
          id: session.subject.id,
          name: session.subject.name,
          color: session.subject.color,
          minutes: 0,
          sessions: 0,
        });
      }

      const item = subjectMap.get(session.subject.id)!;
      item.minutes += session.durationMinutes;
      item.sessions += 1;
    });

    const subjectDistribution = Array.from(subjectMap.values()).sort(
      (a, b) => b.minutes - a.minutes
    );

    const bestSubject = subjectDistribution[0] ?? null;
    const weakSubject =
      subjectDistribution.length > 0
        ? [...subjectDistribution].sort((a, b) => a.minutes - b.minutes)[0]
        : null;

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

    const topicsCompletedThisMonth = activeExam.subjects.reduce(
      (sum, subject) =>
        sum +
        (subject.topics?.filter((topic) => {
          if (!topic.completedAt) return false;
          return topic.completedAt >= monthStart && topic.completedAt <= monthEnd;
        }).length ?? 0),
      0
    );

    const previousTotalMinutes = previousSessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0
    );

    const previousTotalSessions = previousSessions.length;

    function percentChange(current: number, previous: number) {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    }

    const comparison = {
      studyTimeChange: percentChange(totalMinutes, previousTotalMinutes),
      sessionsChange: percentChange(totalSessions, previousTotalSessions),
    };

    const achievements = [
      {
        title: "50 Study Hours",
        unlocked: totalMinutes >= 3000,
      },
      {
        title: "100 Study Hours",
        unlocked: totalMinutes >= 6000,
      },
      {
        title: "20 Focus Sessions",
        unlocked: totalSessions >= 20,
      },
      {
        title: "80% Consistency",
        unlocked: consistency >= 80,
      },
    ];

    let insight = "";

    if (totalMinutes === 0) {
      insight =
        "No study sessions recorded this month yet. Start with one focused session to begin your monthly progress.";
    } else if (monthlyGoalPercent >= 100) {
      insight =
        "Excellent month! You completed your monthly study goal. Use the remaining time to revise weak subjects and mistakes.";
    } else if (monthlyGoalPercent >= 70) {
      insight =
        "You are close to your monthly goal. Maintain your current pace and focus on weak subjects.";
    } else if (consistency < 40) {
      insight =
        "Your consistency is low this month. Try to study at least once daily, even if the session is short.";
    } else {
      insight =
        "You are making progress, but your monthly goal needs more focus. Plan a few longer sessions this week.";
    }

    return NextResponse.json({
      exam: {
        id: activeExam.id,
        name: activeExam.name,
        targetDate: activeExam.targetDate,
      },

      range: {
        year,
        month,
        monthStart: formatDateKey(monthStart),
        monthEnd: formatDateKey(monthEnd),
      },

      stats: {
        totalMinutes,
        totalSessions,
        activeStudyDays,
        consistency,
        monthlyGoalMinutes,
        monthlyGoalPercent,
        overallProgress,
        totalTopics,
        completedTopics,
        topicsCompletedThisMonth,
      },

      dailyMinutes,
      weeklyTrend,
      subjectDistribution,
      bestSubject,
      weakSubject,
      achievements,
      comparison,
      insight,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Monthly analytics failed",
      },
      { status: 500 }
    );
  }
}