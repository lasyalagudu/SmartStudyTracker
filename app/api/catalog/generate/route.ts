/**
 * POST /api/catalog/generate
 *
 * Generates a draft syllabus for an exam that has NO catalog entry.
 * Returns the draft for the student to review and edit — nothing is saved
 * to the database here.  Saving happens only when the student confirms
 * via POST /api/onboarding with { draftSubjects }.
 *
 * Uses the OpenAI API if OPENAI_API_KEY is set, otherwise falls back to a
 * structured placeholder so the rest of the flow still works during dev.
 *
 * Request body:  { examName: string }
 *
 * Response:
 *   {
 *     source: "ai" | "placeholder",
 *     examName: string,
 *     subjects: DraftSubject[]
 *   }
 *
 * DraftSubject: { name, color, topics: [{ name, estimatedHours, priority, difficulty }] }
 */

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

// Color palette cycled across generated subjects
const COLORS = [
  "#7C3AED", "#2563EB", "#059669", "#D97706",
  "#DC2626", "#0891B2", "#DB2777", "#4F46E5",
];

type Priority   = "HIGH" | "MEDIUM" | "LOW";
type Difficulty = "EASY" | "MEDIUM" | "HARD";

interface DraftTopic {
  name: string;
  estimatedHours: number;
  priority: Priority;
  difficulty: Difficulty;
}

interface DraftSubject {
  name: string;
  color: string;
  topics: DraftTopic[];
}

// ─── Placeholder used when no API key is configured ───────────────────────────

function buildPlaceholder(examName: string): DraftSubject[] {
  return [
    {
      name: "Core Concepts",
      color: COLORS[0],
      topics: [
        { name: `Fundamentals of ${examName}`, estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
        { name: "Key Principles & Definitions",  estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
        { name: "Important Formulas & Theorems", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
      ],
    },
    {
      name: "Problem Solving",
      color: COLORS[1],
      topics: [
        { name: "Standard Problem Types",      estimatedHours: 4, priority: "HIGH",   difficulty: "MEDIUM" },
        { name: "Previous Year Questions",      estimatedHours: 5, priority: "HIGH",   difficulty: "HARD" },
        { name: "Mock Test Practice",           estimatedHours: 4, priority: "MEDIUM", difficulty: "MEDIUM" },
      ],
    },
    {
      name: "Revision",
      color: COLORS[2],
      topics: [
        { name: "Quick Revision Notes",        estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
        { name: "Formula Sheet Preparation",   estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
      ],
    },
  ];
}

// ─── AI generation via OpenAI ─────────────────────────────────────────────────

async function generateWithAI(examName: string): Promise<DraftSubject[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No API key");

  const systemPrompt = `You are an expert exam preparation syllabus designer.
Given an exam name, return a structured JSON syllabus with subjects and topics.
Rules:
- Return ONLY valid JSON, no markdown, no explanation.
- Use this exact schema:
  { "subjects": [ { "name": string, "topics": [ { "name": string, "estimatedHours": number, "priority": "HIGH"|"MEDIUM"|"LOW", "difficulty": "EASY"|"MEDIUM"|"HARD" } ] } ] }
- estimatedHours should be realistic (1–8 per topic).
- priority HIGH = most frequently tested or high weightage.
- Create 4–8 subjects with 4–12 topics each.
- Base the syllabus on the actual official/standard curriculum for this exam.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 3000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: `Generate a study syllabus for: ${examName}` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const json = await response.json();
  const raw: string = json.choices?.[0]?.message?.content ?? "";

  // Strip markdown code fences if model wrapped in them
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as { subjects: Array<{ name: string; topics: DraftTopic[] }> };

  // Assign colors
  return parsed.subjects.map((s, i) => ({
    name: s.name,
    color: COLORS[i % COLORS.length],
    topics: s.topics.map((t) => ({
      name: t.name,
      estimatedHours: Math.max(1, Math.min(8, Number(t.estimatedHours) || 2)),
      priority:   (["HIGH", "MEDIUM", "LOW"].includes(t.priority)   ? t.priority   : "MEDIUM") as Priority,
      difficulty: (["EASY", "MEDIUM", "HARD"].includes(t.difficulty) ? t.difficulty : "MEDIUM") as Difficulty,
    })),
  }));
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // Require auth — we don't want anonymous abuse of the AI endpoint
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const examName: string = (body.examName ?? "").trim();

    if (!examName) {
      return NextResponse.json({ error: "examName is required" }, { status: 400 });
    }

    // If a catalog entry already exists, tell the client to use it instead
    const existing = await import("@/lib/prisma").then(({ prisma }) =>
      prisma.examCatalog.findFirst({
        where: {
          OR: [
            { slug: { equals: examName,              mode: "insensitive" } },
            { label: { contains: examName.split(" ")[0], mode: "insensitive" } },
          ],
          isActive: true,
        },
        select: { slug: true, label: true },
      })
    );

    if (existing) {
      return NextResponse.json({
        source: "catalog",
        catalogSlug: existing.slug,
        message: `A verified syllabus for "${existing.label}" already exists in the catalog.`,
      });
    }

    // Try AI generation, fall back to placeholder
    let subjects: DraftSubject[];
    let source: "ai" | "placeholder";

    try {
      subjects = await generateWithAI(examName);
      source = "ai";
    } catch (aiErr) {
      console.warn("[catalog/generate] AI generation failed, using placeholder:", aiErr);
      subjects = buildPlaceholder(examName);
      source = "placeholder";
    }

    return NextResponse.json({ source, examName, subjects });
  } catch (error) {
    console.error("[catalog/generate] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
