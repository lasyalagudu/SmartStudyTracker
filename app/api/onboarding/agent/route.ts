/**
 * POST /api/onboarding/agent
 *
 * The "template agent" — takes an exam selection and auto-populates
 * the full syllabus (subjects + topics with hours/priority/difficulty)
 * in a single Prisma transaction. No LLM. Instant. Free.
 *
 * Request body:
 *   examName    string   — must match an EXAM_TEMPLATES key
 *   targetDate  string?  — ISO date string, optional
 *
 * Response:
 *   { success: true, exam, stats: { subjects, topics, totalHours } }
 */

import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { runTemplateOnboarding } from "@/lib/agentOnboarding";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const body = await req.json();
    const { examName, targetDate } = body as {
      examName: string;
      targetDate?: string;
    };

    if (!examName) {
      return NextResponse.json({ error: "examName is required" }, { status: 400 });
    }

    const result = await runTemplateOnboarding({
      clerkId: clerkUser.id,
      email,
      name: clerkUser.fullName ?? null,
      examName,
      targetDate,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[onboarding/agent] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
