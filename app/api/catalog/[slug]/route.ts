/**
 * GET /api/catalog/[slug]
 *
 * Returns the full syllabus for a single catalog entry — subjects and
 * topics — used by the onboarding UI to render the preview panel and by
 * agentOnboarding when a catalog slug is passed.
 *
 * No auth required — catalog data is public.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const entry = await prisma.examCatalog.findUnique({
      where: { slug: params.slug },
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

    if (!entry || !entry.isActive) {
      return NextResponse.json(
        { error: `No catalog entry found for slug "${params.slug}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({ catalog: entry });
  } catch (error) {
    console.error("[catalog/[slug]] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load catalog entry" },
      { status: 500 }
    );
  }
}
