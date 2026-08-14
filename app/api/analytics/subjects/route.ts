import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function daysSince(date: Date | null) {
  if (!date) return null;

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTopicReadiness(topic: any) {
  return [
    topic.theoryDone,
    topic.problemsDone,
    topic.pyqsDone,
    topic.revisionDone,
    topic.mastered,
  ].filter(Boolean).length;
}

function getTopicHealth(topic: any) {
  const readiness = getTopicReadiness(topic);
  const lastRevisedDays = daysSince(topic.lastRevisedAt);

  if (topic.mastered && topic.confidence >= 4) return "EXCELLENT";
  if (readiness >= 4 && topic.confidence >= 3) return "GOOD";
  if (lastRevisedDays !== null && lastRevisedDays > 14) return "NEEDS_REVISION";
  if (topic.confidence > 0 && topic.confidence <= 2) return "WEAK";

  return "IN_PROGRESS";
}

function getNextAction(topic: any) {
  if (!topic.theoryDone) return "Read Theory";
  if (!topic.problemsDone) return "Solve Problems";
  if (!topic.pyqsDone) return "Attempt PYQs";
  if (!topic.revisionDone) return "Revise";
  if (!topic.mastered) return "Mark Mastered";
  if (topic.confidence < 4) return "Improve Confidence";
  return "Maintain";
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
            topics: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
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
      },
      include: {
        subject: true,
        topic: true,
      },
    });

    const subjects = activeExam.subjects.map((subject) => {
      const subjectSessions = sessions.filter(
        (session) => session.subjectId === subject.id
      );

      const totalStudyMinutes = subjectSessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0
      );

      const totalTopics = subject.topics.length;

      const completedTopics = subject.topics.filter(
        (topic) => topic.status === "COMPLETED" || topic.mastered
      ).length;

      const progress =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      const confidenceTopics = subject.topics.filter(
        (topic) => topic.confidence > 0
      );

      const averageConfidence =
        confidenceTopics.length > 0
          ? Math.round(
              confidenceTopics.reduce(
                (sum, topic) => sum + topic.confidence,
                0
              ) / confidenceTopics.length
            )
          : 0;

      const breakdown = {
        theoryDone: subject.topics.filter((topic) => topic.theoryDone).length,
        problemsDone: subject.topics.filter((topic) => topic.problemsDone).length,
        pyqsDone: subject.topics.filter((topic) => topic.pyqsDone).length,
        revisionDone: subject.topics.filter((topic) => topic.revisionDone).length,
        mastered: subject.topics.filter((topic) => topic.mastered).length,
      };

      const topicHealth = subject.topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        status: topic.status,
        difficulty: topic.difficulty,
        priority: topic.priority,
        confidence: topic.confidence,
        readiness: getTopicReadiness(topic),
        health: getTopicHealth(topic),
        nextAction: getNextAction(topic),
        estimatedHours: topic.estimatedHours,
        lastRevisedAt: topic.lastRevisedAt,
        completedAt: topic.completedAt,
      }));

      const weakTopics = topicHealth
        .filter(
          (topic) =>
            topic.health === "WEAK" ||
            topic.health === "NEEDS_REVISION" ||
            (topic.difficulty === "HARD" &&
              topic.priority === "HIGH" &&
              topic.readiness < 4)
        )
        .slice(0, 5);

      return {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        totalTopics,
        completedTopics,
        progress,
        totalStudyMinutes,
        totalSessions: subjectSessions.length,
        averageConfidence,
        breakdown,
        weakTopics,
        topicHealth,
      };
    });

    return NextResponse.json({
      exam: {
        id: activeExam.id,
        name: activeExam.name,
      },
      subjects,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Subject analytics failed",
      },
      { status: 500 }
    );
  }
}