/**
 * Shared server-side function for daily analytics data.
 *
 * Used by both:
 *  - app/api/analytics/daily/route.ts  (API route for client-side fetches)
 *  - app/(dashboard)/analytics/daily/page.tsx  (direct server component call)
 *
 * Keeping the logic here avoids the previous anti-pattern where the server
 * component called its own API via fetch("http://localhost:3000/api/..."),
 * which broke in production and added a pointless internal HTTP round-trip.
 */
import { currentUser } from "@clerk/nextjs/server";
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

export type DailyAnalyticsData = Awaited<ReturnType<typeof getDailyAnalytics>>;

export async function getDailyAnalytics() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
  if (!user) throw new Error("User not found");

  const activeExam = await prisma.exam.findFirst({
    where: { userId: user.id, isActive: true },
    include: {
      subjects: {
        include: { topics: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!activeExam) throw new Error("No active exam found");

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const [sessions, todayTasks, completedTasksToday, completedTopicsToday] =
    await Promise.all([
      prisma.timerSession.findMany({
        where: {
          userId: user.id,
          examId: activeExam.id,
          completed: true,
          sessionType: "FOCUS",
          startedAt: { gte: todayStart, lte: todayEnd },
        },
        include: { subject: true, topic: true },
        orderBy: { startedAt: "asc" },
      }),

      prisma.task.findMany({
        where: {
          userId: user.id,
          dueDate: { gte: todayStart, lte: todayEnd },
        },
        include: { subject: true, topic: true },
        orderBy: { priority: "desc" },
      }),

      prisma.task.count({
        where: {
          userId: user.id,
          completed: true,
          completedAt: { gte: todayStart, lte: todayEnd },
        },
      }),

      prisma.topic.count({
        where: {
          subject: { exam: { userId: user.id } },
          completedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
    ]);

  // Summary
  const studyMinutes = sessions.reduce((s, x) => s + x.durationMinutes, 0);
  const focusSessions = sessions.length;
  const totalTasks = todayTasks.length;
  const pendingTasks = todayTasks.filter((t) => !t.completed).length;

  // Subject-wise study time
  const subjectStudyMap = new Map<
    string,
    { id: string; name: string; color: string; minutes: number }
  >();
  sessions.forEach((session) => {
    if (!session.subject) return;
    const entry = subjectStudyMap.get(session.subject.id) ?? {
      id: session.subject.id,
      name: session.subject.name,
      color: session.subject.color,
      minutes: 0,
    };
    entry.minutes += session.durationMinutes;
    subjectStudyMap.set(session.subject.id, entry);
  });
  const subjectStudyTime = Array.from(subjectStudyMap.values()).sort(
    (a, b) => b.minutes - a.minutes
  );

  // Topic progress
  const allTopics = activeExam.subjects.flatMap((s) => s.topics);
  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter(
    (t) => t.status === "COMPLETED" || t.mastered
  ).length;
  const theoryDone = allTopics.filter((t) => t.theoryDone).length;
  const problemsDone = allTopics.filter((t) => t.problemsDone).length;
  const pyqsDone = allTopics.filter((t) => t.pyqsDone).length;
  const revisionDone = allTopics.filter((t) => t.revisionDone).length;

  const progress = {
    theory: totalTopics > 0 ? Math.round((theoryDone / totalTopics) * 100) : 0,
    problems:
      totalTopics > 0 ? Math.round((problemsDone / totalTopics) * 100) : 0,
    pyqs: totalTopics > 0 ? Math.round((pyqsDone / totalTopics) * 100) : 0,
    revision:
      totalTopics > 0 ? Math.round((revisionDone / totalTopics) * 100) : 0,
  };

  // Goals
  const studyGoalMinutes = user.dailyStudyGoalMinutes ?? 360;
  const taskGoal = user.dailyTaskGoal ?? 5;
  const studyGoalPercent =
    studyGoalMinutes > 0
      ? Math.min(100, Math.round((studyMinutes / studyGoalMinutes) * 100))
      : 0;
  const taskGoalPercent =
    taskGoal > 0
      ? Math.min(100, Math.round((completedTasksToday / taskGoal) * 100))
      : 0;

  // Productivity score
  const productivityScore = Math.round(
    studyGoalPercent * 0.5 + taskGoalPercent * 0.3 + progress.revision * 0.2
  );

  const bestSubject = subjectStudyTime[0] ?? null;

  // Insight
  let insight: string;
  if (studyMinutes === 0) {
    insight =
      "No study sessions recorded today. Start with a 30-minute focus session to maintain your study streak.";
  } else if (productivityScore >= 90) {
    insight =
      "Outstanding work today! You achieved your study goal and maintained excellent productivity. Keep this momentum going.";
  } else if (productivityScore >= 75) {
    insight =
      "Great progress today. Completing one more revision or task will help you finish the day even stronger.";
  } else if (taskGoalPercent < 50) {
    insight =
      "You've studied well, but several planned tasks are still pending. Try completing the highest priority task before ending today.";
  } else {
    insight =
      "Good effort today. Stay consistent with your study schedule and finish one more focused session if time permits.";
  }

  return {
    exam: {
      id: activeExam.id,
      name: activeExam.name,
      targetDate: activeExam.targetDate,
    },
    date: formatDateKey(today),
    summary: {
      studyMinutes,
      focusSessions,
      totalTasks,
      completedTasks: completedTasksToday,
      pendingTasks,
      completedTopics: completedTopicsToday,
    },
    goals: {
      studyGoalMinutes,
      studyGoalPercent,
      dailyTaskGoal: taskGoal,
      taskGoalPercent,
    },
    progress,
    productivityScore,
    subjectStudyTime,
    bestSubject,
    todayTasks,
    stats: {
      totalTopics,
      completedTopics,
      theoryDone,
      problemsDone,
      pyqsDone,
      revisionDone,
    },
    insight,
  };
}
