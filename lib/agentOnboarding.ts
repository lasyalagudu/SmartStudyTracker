/**
 * lib/agentOnboarding.ts
 *
 * Core business logic for the catalog-based onboarding agent.
 * Called by:
 *   - POST /api/onboarding        (when useTemplate: true)
 *   - POST /api/onboarding/agent  (dedicated agent endpoint)
 *
 * Data source is now the ExamCatalog DB table — NOT the old examTemplates.ts
 * TypeScript file.  Adding a new exam is a DB operation only; no code changes.
 *
 * Two modes:
 *   1. catalogSlug   — look up a verified catalog entry and copy it
 *   2. draftSubjects — student-reviewed AI-generated draft passed in directly
 *
 * Both run inside a single Prisma transaction for atomicity.
 */

import { prisma } from "@/lib/prisma";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface DraftTopic {
  name: string;
  estimatedHours: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface DraftSubject {
  name: string;
  color: string;
  topics: DraftTopic[];
}

export interface TemplateOnboardingInput {
  clerkId: string;
  email: string;
  name: string | null;
  examName: string;
  targetDate?: string;
  /** Catalog slug (e.g. "GATE_CSE"). Used when a verified template exists. */
  catalogSlug?: string;
  /**
   * Pre-built subjects from an AI-generated and student-reviewed draft.
   * Used when no catalog entry exists and the student has reviewed + approved
   * the draft syllabus.  Takes priority over catalogSlug.
   */
  draftSubjects?: DraftSubject[];
}

export interface TemplateOnboardingResult {
  exam: {
    id: string;
    name: string;
    targetDate: Date | null;
    isActive: boolean;
  };
  stats: {
    subjects: number;
    topics: number;
    totalHours: number;
  };
}

// ─── Main function ────────────────────────────────────────────────────────────

export async function runTemplateOnboarding(
  input: TemplateOnboardingInput
): Promise<TemplateOnboardingResult> {
  const { clerkId, email, name, examName, targetDate, catalogSlug, draftSubjects } = input;

  // ── Resolve which subject+topic data to use ──────────────────────────────

  // Mode A: student passed in a reviewed AI draft
  if (draftSubjects && draftSubjects.length > 0) {
    return _runWithDraft({ clerkId, email, name, examName, targetDate, subjects: draftSubjects });
  }

  // Mode B: look up the catalog by slug
  if (catalogSlug) {
    return _runFromCatalog({ clerkId, email, name, examName, targetDate, catalogSlug });
  }

  // Fallback: try catalog lookup by examName treated as a slug
  return _runFromCatalog({ clerkId, email, name, examName, targetDate, catalogSlug: examName });
}

// ─── Mode A: copy from verified catalog ──────────────────────────────────────

async function _runFromCatalog(params: {
  clerkId: string;
  email: string;
  name: string | null;
  examName: string;
  targetDate?: string;
  catalogSlug: string;
}): Promise<TemplateOnboardingResult> {
  const { clerkId, email, name, examName, targetDate, catalogSlug } = params;

  // Load catalog entry + all subjects + all topics in one query
  const catalogEntry = await prisma.examCatalog.findUnique({
    where: { slug: catalogSlug },
    include: {
      subjects: {
        orderBy: { order: "asc" },
        include: {
          topics: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!catalogEntry) {
    throw new Error(
      `No verified syllabus found for "${catalogSlug}". ` +
      `Use the AI-assisted draft path or add subjects manually.`
    );
  }

  const subjects: DraftSubject[] = catalogEntry.subjects.map((s) => ({
    name: s.name,
    color: s.color,
    topics: s.topics.map((t) => ({
      name: t.name,
      estimatedHours: t.estimatedHours,
      priority: t.priority as "HIGH" | "MEDIUM" | "LOW",
      difficulty: t.difficulty as "EASY" | "MEDIUM" | "HARD",
    })),
  }));

  return _runWithDraft({
    clerkId,
    email,
    name,
    examName,
    targetDate,
    subjects,
    totalHoursOverride: catalogEntry.totalHours,
  });
}

// ─── Mode B: use a pre-built subjects array (draft or catalog-derived) ────────

async function _runWithDraft(params: {
  clerkId: string;
  email: string;
  name: string | null;
  examName: string;
  targetDate?: string;
  subjects: DraftSubject[];
  totalHoursOverride?: number;
}): Promise<TemplateOnboardingResult> {
  const { clerkId, email, name, examName, targetDate, subjects, totalHoursOverride } = params;

  const totalHours =
    totalHoursOverride ??
    subjects.reduce((sum, s) => sum + s.topics.reduce((t, topic) => t + topic.estimatedHours, 0), 0);

  const result = await prisma.$transaction(
    async (tx) => {
      // 1. Upsert the Clerk user
      const user = await tx.user.upsert({
        where: { clerkId },
        update: { email, name },
        create: { clerkId, email, name },
      });

      // 2. Deactivate any existing active exam
      await tx.exam.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
      });

      // 3. Create the new exam
      const exam = await tx.exam.create({
        data: {
          userId: user.id,
          name: examName,
          targetDate: targetDate ? new Date(targetDate) : null,
          isActive: true,
        },
      });

      // 4. Create subjects + topics
      let totalTopicsCreated = 0;

      for (let si = 0; si < subjects.length; si++) {
        const subjectData = subjects[si];

        const subject = await tx.subject.create({
          data: {
            examId: exam.id,
            name: subjectData.name,
            color: subjectData.color,
            order: si,
          },
        });

        if (subjectData.topics.length > 0) {
          await tx.topic.createMany({
            data: subjectData.topics.map((t, ti) => ({
              subjectId: subject.id,
              name: t.name,
              order: ti,
              estimatedHours: t.estimatedHours,
              priority: t.priority,
              difficulty: t.difficulty,
              status: "NOT_STARTED" as const,
              theoryDone: false,
              problemsDone: false,
              pyqsDone: false,
              revisionDone: false,
              mastered: false,
              confidence: 0,
            })),
          });
          totalTopicsCreated += subjectData.topics.length;
        }
      }

      // 5. Mark onboarding complete
      await tx.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
      });

      return {
        exam: {
          id: exam.id,
          name: exam.name,
          targetDate: exam.targetDate,
          isActive: exam.isActive,
        },
        stats: {
          subjects: subjects.length,
          topics: totalTopicsCreated,
          totalHours,
        },
      };
    },
    { timeout: 20000 }
  );

  return result;
}
