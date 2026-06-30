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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkUser.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
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
        {
          error: "No active exam found",
        },
        {
          status: 400,
        }
      );
    }

    const today = new Date();

    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const [
      sessions,
      todayTasks,
      completedTasksToday,
      completedTopicsToday,
    ] = await Promise.all([
      prisma.timerSession.findMany({
        where: {
          userId: user.id,
          examId: activeExam.id,
          completed: true,
          sessionType: "FOCUS",
          startedAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: {
          subject: true,
          topic: true,
        },
        orderBy: {
          startedAt: "asc",
        },
      }),

      prisma.task.findMany({
        where: {
          userId: user.id,
          dueDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: {
          subject: true,
          topic: true,
        },
        orderBy: {
          priority: "desc",
        },
      }),

      prisma.task.count({
        where: {
          userId: user.id,
          completed: true,
          completedAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),

      prisma.topic.count({
        where: {
          subject: {
            exam: {
              userId: user.id,
            },
          },
          completedAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
    ]);

    //-------------------------------------
    // Summary
    //-------------------------------------

    const studyMinutes = sessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0
    );

    const focusSessions = sessions.length;

    const totalTasks = todayTasks.length;

    const pendingTasks = todayTasks.filter(
      (task) => !task.completed
    ).length;

    //-------------------------------------
    // Subject Wise Study Time
    //-------------------------------------

    const subjectStudyMap = new Map<
      string,
      {
        id: string;
        name: string;
        color: string;
        minutes: number;
      }
    >();

    sessions.forEach((session) => {
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

    const subjectStudyTime = Array.from(
      subjectStudyMap.values()
    ).sort((a, b) => b.minutes - a.minutes);

    //-------------------------------------
    // Topic Progress
    //-------------------------------------

    const allTopics = activeExam.subjects.flatMap(
      (subject) => subject.topics
    );

    const totalTopics = allTopics.length;

    const completedTopics = allTopics.filter(
      (topic) =>
        topic.status === "COMPLETED" || topic.mastered
    ).length;

    const theoryDone = allTopics.filter(
      (topic) => topic.theoryDone
    ).length;

    const problemsDone = allTopics.filter(
      (topic) => topic.problemsDone
    ).length;

    const pyqsDone = allTopics.filter(
      (topic) => topic.pyqsDone
    ).length;

    const revisionDone = allTopics.filter(
      (topic) => topic.revisionDone
    ).length;

    const progress = {
      theory:
        totalTopics > 0
          ? Math.round((theoryDone / totalTopics) * 100)
          : 0,

      problems:
        totalTopics > 0
          ? Math.round((problemsDone / totalTopics) * 100)
          : 0,

      pyqs:
        totalTopics > 0
          ? Math.round((pyqsDone / totalTopics) * 100)
          : 0,

      revision:
        totalTopics > 0
          ? Math.round((revisionDone / totalTopics) * 100)
          : 0,
    };

        //-------------------------------------
    // Today's Goal Progress
    //-------------------------------------

    const studyGoalMinutes = user.dailyStudyGoalMinutes ?? 360;
    const taskGoal = user.dailyTaskGoal ?? 5;

    const studyGoalPercent =
      studyGoalMinutes > 0
        ? Math.min(
            100,
            Math.round((studyMinutes / studyGoalMinutes) * 100)
          )
        : 0;

    const taskGoalPercent =
      taskGoal > 0
        ? Math.min(
            100,
            Math.round((completedTasksToday / taskGoal) * 100)
          )
        : 0;

    //-------------------------------------
    // Productivity Score
    //-------------------------------------

    const productivityScore = Math.round(
      studyGoalPercent * 0.5 +
        taskGoalPercent * 0.3 +
        progress.revision * 0.2
    );

    //-------------------------------------
    // Best Subject Today
    //-------------------------------------

    const bestSubject =
      subjectStudyTime.length > 0
        ? subjectStudyTime[0]
        : null;

    //-------------------------------------
    // AI Insight
    //-------------------------------------

    let insight = "";

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
    };

    //-------------------------------------
    // Response
    //-------------------------------------

    return NextResponse.json({
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
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Daily analytics failed",
      },
      {
        status: 500,
      }
    );
  }
}