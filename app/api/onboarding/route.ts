import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runTemplateOnboarding, type DraftSubject } from "@/lib/agentOnboarding";

const colors = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#0891B2"];

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
    const {
      examName,
      targetDate,
      subjects,        // string[] — manual subject names (original path)
      useTemplate,     // boolean — use catalog template
      catalogSlug,     // string  — explicit catalog slug override
      draftSubjects,   // DraftSubject[] — student-reviewed AI draft
    } = body;

    if (!examName) {
      return NextResponse.json({ error: "Exam name is required" }, { status: 400 });
    }

    // ── Path A: catalog template or AI-reviewed draft ─────────────────────
    // useTemplate=true OR catalogSlug provided OR draftSubjects provided
    if (useTemplate || catalogSlug || (Array.isArray(draftSubjects) && draftSubjects.length > 0)) {
      const result = await runTemplateOnboarding({
        clerkId: clerkUser.id,
        email,
        name: clerkUser.fullName ?? null,
        examName,
        targetDate,
        catalogSlug: catalogSlug ?? (useTemplate ? examName : undefined),
        draftSubjects: Array.isArray(draftSubjects) ? (draftSubjects as DraftSubject[]) : undefined,
      });
      return NextResponse.json({ success: true, ...result });
    }

    // ── Path B: manual — user entered subject names, no topics yet ────────
    const user = await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: { email, name: clerkUser.fullName },
      create: { clerkId: clerkUser.id, email, name: clerkUser.fullName },
    });

    await prisma.exam.updateMany({
      where: { userId: user.id, isActive: true },
      data: { isActive: false },
    });

    const exam = await prisma.exam.create({
      data: {
        userId: user.id,
        name: examName,
        targetDate: targetDate ? new Date(targetDate) : null,
        isActive: true,
        subjects: {
          create: Array.isArray(subjects)
            ? subjects.map((name: string, index: number) => ({
                name,
                color: colors[index % colors.length],
                order: index,
              }))
            : [],
        },
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true },
    });

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error("[onboarding] POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
