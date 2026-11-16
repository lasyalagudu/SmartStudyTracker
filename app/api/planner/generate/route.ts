/**
 * POST /api/planner/generate
 *
 * Smart daily plan generator — no LLM, deterministic algorithm.
 *
 * The algorithm picks the best topics to study today using these signals:
 *   1. Priority    — HIGH topics are always considered first
 *   2. Status      — NOT_STARTED before IN_PROGRESS (first touch > stalled work)
 *   3. Difficulty  — HARD topics get larger time slots
 *   4. Exam urgency — when < 30 days left, even LOW-priority topics are included
 *   5. Revision due — topics completed but not revised in 7+ days get a revision task
 *   6. Daily cap    — stops when we hit the user's daily study goal (minutes)
 *
 * Request body:
 *   date          string    "YYYY-MM-DD" — which day to generate for (default: today)
 *   hoursAvailable number  — override: how many hours the user has today (default: dailyStudyGoalMinutes / 60)
 *
 * Response:
 *   { created: number, tasks: Task[] }
 */

import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Scoring weights (tune these without touching the algo) ─────────────────
const W_PRIORITY = { HIGH: 100, MEDIUM: 60, LOW: 20 } as const;
const W_STATUS   = { NOT_STARTED: 30, IN_PROGRESS: 50, COMPLETED: 0 } as const;
const W_DIFF     = { HARD: 20, MEDIUM: 10, EASY: 0 } as const;

// Revision is due when completed but not revised in this many days
const REVISION_INTERVAL_DAYS = 7;
// Max topics per day — keeps the plan realistic
const MAX_TOPICS_PER_DAY = 8;

function dateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysBetween(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

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

    const body = await req.json().catch(() => ({}));
    const today = new Date();
    const targetDateStr: string = body.date ?? dateStr(today);
    const hoursOverride: number | undefined = body.hoursAvailable;

    // Parse the target date (treat as local midnight to avoid TZ drift)
    const [year, month, day] = targetDateStr.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day);
    const targetStart = new Date(`${targetDateStr}T00:00:00`);
    const targetEnd   = new Date(`${targetDateStr}T23:59:59`);

    // ── 1. Get the active exam ───────────────────────────────────────────────
    const exam = await prisma.exam.findFirst({
      where: { userId: user.id, isActive: true },
      include: {
        subjects: {
          include: {
            topics: {
              where: {
                // Only topics that are not fully mastered
                mastered: false,
              },
              orderBy: [{ priority: "desc" }, { order: "asc" }],
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "No active exam found" }, { status: 404 });
    }

    // ── 2. Skip topics that already have a task today ────────────────────────
    const existingTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        dueDate: { gte: targetStart, lte: targetEnd },
      },
      select: { topicId: true },
    });
    const coveredTopicIds = new Set(
      existingTasks.map((t) => t.topicId).filter(Boolean) as string[]
    );

    // ── 3. Compute available minutes for today ───────────────────────────────
    const dailyGoalMinutes = user.dailyStudyGoalMinutes ?? 360; // default 6h
    const availableMinutes = hoursOverride
      ? hoursOverride * 60
      : dailyGoalMinutes;

    // ── 4. Score every candidate topic ──────────────────────────────────────
    const daysUntilExam = exam.targetDate
      ? daysBetween(today, new Date(exam.targetDate))
      : null;
    const isUrgent = daysUntilExam !== null && daysUntilExam <= 30;

    type Candidate = {
      topic: typeof exam.subjects[0]["topics"][0];
      subject: typeof exam.subjects[0];
      score: number;
      taskType: "study" | "revision";
      minutesNeeded: number;
    };

    const candidates: Candidate[] = [];

    for (const subject of exam.subjects) {
      for (const topic of subject.topics) {
        if (coveredTopicIds.has(topic.id)) continue;

        // Skip LOW priority topics unless exam is urgent or they're IN_PROGRESS
        if (
          topic.priority === "LOW" &&
          !isUrgent &&
          topic.status !== "IN_PROGRESS"
        ) continue;

        // Skip COMPLETED topics unless revision is due
        if (topic.status === "COMPLETED" || topic.mastered) {
          const lastRevised = topic.lastRevisedAt
            ? new Date(topic.lastRevisedAt)
            : topic.completedAt
              ? new Date(topic.completedAt)
              : null;

          if (!lastRevised) continue;

          const daysSinceRevision = daysBetween(lastRevised, today);
          if (daysSinceRevision < REVISION_INTERVAL_DAYS) continue;

          // Revision candidate
          const score =
            W_PRIORITY[topic.priority] +
            15 + // bonus for revision
            (isUrgent ? 25 : 0);

          candidates.push({
            topic,
            subject,
            score,
            taskType: "revision",
            minutesNeeded: Math.min(30, topic.estimatedHours * 15), // revision = 15-30 min
          });
          continue;
        }

        // Study candidate
        const score =
          W_PRIORITY[topic.priority] +
          W_STATUS[topic.status] +
          W_DIFF[topic.difficulty] +
          (isUrgent ? 20 : 0) +
          // Small boost for topics with confidence < 3 (needs more work)
          (topic.confidence < 3 ? 10 : 0);

        // Time estimate: use stored estimatedHours, capped per session
        // A single session covers at most 2h of a topic
        const rawMinutes = topic.estimatedHours * 60;
        const minutesNeeded = Math.min(120, Math.max(30, rawMinutes / 3));

        candidates.push({
          topic,
          subject,
          score,
          taskType: "study",
          minutesNeeded,
        });
      }
    }

    // ── 5. Sort by score descending, pick until we hit the daily cap ─────────
    candidates.sort((a, b) => b.score - a.score);

    const selected: Candidate[] = [];
    let minutesAllocated = 0;

    for (const candidate of candidates) {
      if (selected.length >= MAX_TOPICS_PER_DAY) break;
      if (minutesAllocated + candidate.minutesNeeded > availableMinutes + 30) break; // 30 min overflow allowed
      selected.push(candidate);
      minutesAllocated += candidate.minutesNeeded;
    }

    if (selected.length === 0) {
      return NextResponse.json({
        created: 0,
        tasks: [],
        message:
          daysUntilExam !== null && daysUntilExam < 0
            ? "Your exam has passed — nothing left to plan."
            : "All topics are up to date! No new tasks needed for today.",
      });
    }

    // ── 6. Map priority: HIGH topics → HIGH task, rest → MEDIUM ─────────────
    function taskPriority(
      topicPriority: "HIGH" | "MEDIUM" | "LOW",
      taskType: "study" | "revision"
    ): "HIGH" | "MEDIUM" | "LOW" {
      if (taskType === "revision") return "MEDIUM";
      return topicPriority;
    }

    // ── 7. Build task titles ─────────────────────────────────────────────────
    function buildTitle(candidate: Candidate): string {
      const prefix = candidate.taskType === "revision" ? "📝 Revise" : "📖 Study";
      return `${prefix}: ${candidate.topic.name}`;
    }

    // ── 8. Bulk-create tasks in a transaction ────────────────────────────────
    const created = await prisma.$transaction(
      selected.map((c) =>
        prisma.task.create({
          data: {
            userId: user.id,
            examId: exam.id,
            subjectId: c.subject.id,
            topicId: c.topic.id,
            title: buildTitle(c),
            dueDate: targetDate,
            priority: taskPriority(c.topic.priority, c.taskType),
            completed: false,
          },
          include: {
            subject: true,
            topic: true,
          },
        })
      )
    );

    return NextResponse.json({
      created: created.length,
      tasks: created,
      minutesPlanned: Math.round(minutesAllocated),
      message: `Generated ${created.length} task${created.length === 1 ? "" : "s"} · ~${Math.round(minutesAllocated / 60 * 10) / 10}h planned`,
    });
  } catch (error) {
    console.error("[planner/generate] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
