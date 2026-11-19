/**
 * POST /api/planner/generate
 *
 * Smart daily plan generator — deterministic algorithm.
 *
 * HOW IT CONNECTS TO THE SYLLABUS:
 *   - Reads topic.status (NOT_STARTED / IN_PROGRESS / COMPLETED) from the syllabus
 *   - COMPLETED topics are skipped unless revision is due (7+ days since last revision)
 *   - IN_PROGRESS topics score higher than NOT_STARTED (finish what you started)
 *   - Topics already planned in the last COOLDOWN_DAYS are skipped so the plan
 *     advances through the syllabus day by day instead of repeating the same topics
 *
 * WHY IT WAS REPEATING:
 *   Previously it only checked if a topic had a task "today" — so the same
 *   top-scored topics would regenerate every day since they were never marked done.
 *   Now it checks the last COOLDOWN_DAYS so each topic appears at most once
 *   per cooldown window, forcing the plan to pick the next topics in line.
 *
 * SCORING (higher = picked sooner):
 *   Priority:    HIGH=100  MEDIUM=60  LOW=20
 *   Status:      IN_PROGRESS=50  NOT_STARTED=30  COMPLETED=0
 *   Difficulty:  HARD=20  MEDIUM=10  EASY=0
 *   Urgency:     +20 when exam is within 30 days
 *   Low conf:    +10 when topic.confidence < 3
 *   Order bonus: -0.1 × topic.order  (earlier topics preferred as tiebreaker)
 */

import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const W_PRIORITY  = { HIGH: 100, MEDIUM: 60, LOW: 20 } as const;
const W_STATUS    = { NOT_STARTED: 30, IN_PROGRESS: 50, COMPLETED: 0 } as const;
const W_DIFF      = { HARD: 20, MEDIUM: 10, EASY: 0 } as const;

// A topic planned in the last N days won't be suggested again.
// This is the key fix — it forces the plan to cycle through the syllabus.
// Cap per day — 5 topics is realistic for a student
const MAX_TOPICS_PER_DAY = 5;

// A topic planned in the last N days won't be suggested again.
const COOLDOWN_DAYS = 1; // 1 day cooldown so tomorrow always gets different topics

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

    const [year, month, day] = targetDateStr.split("-").map(Number);
    const targetDate  = new Date(year, month - 1, day);
    const targetStart = new Date(`${targetDateStr}T00:00:00`);
    const targetEnd   = new Date(`${targetDateStr}T23:59:59`);

    // ── 1. Active exam + full syllabus ───────────────────────────────────────
    const exam = await prisma.exam.findFirst({
      where: { userId: user.id, isActive: true },
      include: {
        subjects: {
          include: {
            topics: {
              where: { mastered: false },
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

    // ── 2. Find topics already planned OR completed in the cooldown window ───
    // Check both planned tasks AND completed tasks so the cooldown works even
    // if the student deletes their planned tasks or generates fresh each day.
    const cooldownStart = new Date(targetDate);
    cooldownStart.setDate(cooldownStart.getDate() - COOLDOWN_DAYS);

    const [recentTasks, recentCompletedTopics] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId: user.id,
          dueDate: { gte: cooldownStart, lte: targetEnd },
          topicId: { not: null },
        },
        select: { topicId: true, dueDate: true },
      }),
      // Also check topics that were actually completed recently via syllabus
      prisma.topic.findMany({
        where: {
          subject: { examId: exam.id },
          status: "IN_PROGRESS",
          updatedAt: { gte: cooldownStart },
        },
        select: { id: true },
      }),
    ]);

    // Topics planned today — never re-add as duplicates
    const todayTopicIds = new Set(
      recentTasks
        .filter((t) => t.dueDate && t.dueDate >= targetStart)
        .map((t) => t.topicId as string)
    );

    // Topics in cooldown window — skip unless IN_PROGRESS
    const recentTopicIds = new Set([
      ...recentTasks.map((t) => t.topicId as string),
      ...recentCompletedTopics.map((t) => t.id),
    ]);

    // ── 3. Available minutes — cap at 4 hours regardless of goal ────────────
    // Previously used the full dailyStudyGoalMinutes (360 min = 6h) which
    // caused 12 topics to be selected every day. Cap at 4h so the plan
    // generates 4-5 focused topics instead of an overwhelming list.
    const dailyGoalMinutes = user.dailyStudyGoalMinutes ?? 360;
    const availableMinutes = hoursOverride
      ? hoursOverride * 60
      : Math.min(dailyGoalMinutes, 240); // 4h max per generated plan

    // ── 4. Score candidates ──────────────────────────────────────────────────
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

        // Already planned today — skip entirely (no duplicates)
        if (todayTopicIds.has(topic.id)) continue;

        // In cooldown window — skip unless it's IN_PROGRESS (don't abandon started topics)
        if (recentTopicIds.has(topic.id) && topic.status !== "IN_PROGRESS") continue;

        // Skip LOW priority unless urgent or already started
        if (
          topic.priority === "LOW" &&
          !isUrgent &&
          topic.status !== "IN_PROGRESS"
        ) continue;

        // COMPLETED topics — only suggest if revision is due
        if (topic.status === "COMPLETED") {
          const lastRevised = topic.lastRevisedAt
            ? new Date(topic.lastRevisedAt)
            : topic.completedAt
              ? new Date(topic.completedAt)
              : null;

          if (!lastRevised) continue;

          const daysSinceRevision = daysBetween(lastRevised, today);
          if (daysSinceRevision < REVISION_INTERVAL_DAYS) continue;

          candidates.push({
            topic,
            subject,
            score: W_PRIORITY[topic.priority] + 15 + (isUrgent ? 25 : 0),
            taskType: "revision",
            minutesNeeded: Math.min(30, topic.estimatedHours * 15),
          });
          continue;
        }

        // Study candidate
        const score =
          W_PRIORITY[topic.priority] +
          W_STATUS[topic.status] +
          W_DIFF[topic.difficulty] +
          (isUrgent ? 20 : 0) +
          (topic.confidence < 3 ? 10 : 0) -
          // Tiebreaker: earlier topics in the syllabus order are slightly preferred
          topic.order * 0.1;

        const rawMinutes  = topic.estimatedHours * 60;
        const minutesNeeded = Math.min(120, Math.max(30, rawMinutes / 3));

        candidates.push({ topic, subject, score, taskType: "study", minutesNeeded });
      }
    }

    // ── 5. Sort and pick until daily cap ─────────────────────────────────────
    candidates.sort((a, b) => b.score - a.score);

    const selected: Candidate[] = [];
    let minutesAllocated = 0;

    for (const c of candidates) {
      if (selected.length >= MAX_TOPICS_PER_DAY) break;
      if (minutesAllocated + c.minutesNeeded > availableMinutes + 30) break;
      selected.push(c);
      minutesAllocated += c.minutesNeeded;
    }

    if (selected.length === 0) {
      // All remaining topics are in cooldown — this means the student has
      // covered everything recently. Relax the cooldown and pick anyway.
      for (const c of candidates) {
        if (selected.length >= MAX_TOPICS_PER_DAY) break;
        selected.push(c);
        minutesAllocated += c.minutesNeeded;
      }

      // Still nothing — truly all done
      if (selected.length === 0) {
        return NextResponse.json({
          created: 0,
          tasks: [],
          message:
            daysUntilExam !== null && daysUntilExam < 0
              ? "Your exam date has passed."
              : "All topics covered recently! Check the Syllabus Tracker to mark topics complete or add new ones.",
        });
      }
    }

    // ── 6. Create tasks ──────────────────────────────────────────────────────
    function taskPriority(
      topicPriority: "HIGH" | "MEDIUM" | "LOW",
      taskType: "study" | "revision"
    ): "HIGH" | "MEDIUM" | "LOW" {
      if (taskType === "revision") return "MEDIUM";
      return topicPriority;
    }

    function buildTitle(c: Candidate): string {
      const prefix = c.taskType === "revision" ? "📝 Revise" : "📖 Study";
      return `${prefix}: ${c.topic.name}`;
    }

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
          include: { subject: true, topic: true },
        })
      )
    );

    return NextResponse.json({
      created: created.length,
      tasks: created,
      minutesPlanned: Math.round(minutesAllocated),
      message: `Generated ${created.length} task${created.length === 1 ? "" : "s"} · ~${Math.round((minutesAllocated / 60) * 10) / 10}h planned`,
    });

  } catch (error) {
    console.error("[planner/generate] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
