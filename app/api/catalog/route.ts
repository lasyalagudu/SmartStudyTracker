/**
 * GET /api/catalog
 *
 * Returns all active ExamCatalog entries — the list shown to students
 * during onboarding so they can pick an exam.
 *
 * Response shape:
 *   { exams: CatalogListItem[] }
 *
 * CatalogListItem:
 *   id, slug, label, description, icon, totalHours,
 *   subjectCount, topicCount
 *
 * No auth required — this is public catalog data.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const entries = await prisma.examCatalog.findMany({
      where: { isActive: true },
      orderBy: { label: "asc" },
      include: {
        subjects: {
          select: {
            id: true,
            _count: { select: { topics: true } },
          },
        },
      },
    });

    const exams = entries.map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      label: entry.label,
      description: entry.description,
      icon: entry.icon,
      totalHours: entry.totalHours,
      subjectCount: entry.subjects.length,
      topicCount: entry.subjects.reduce((n, s) => n + s._count.topics, 0),
    }));

    return NextResponse.json({ exams });
  } catch (error) {
    console.error("[catalog] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load exam catalog" },
      { status: 500 }
    );
  }
}
