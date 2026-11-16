/**
 * GET /api/mentor/[mentorId]
 * Returns a single approved mentor's full profile for the public profile page.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ mentorId: string }> }
) {
  try {
    const { mentorId } = await params;

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      include: {
        user: { select: { name: true } },
        exams: { orderBy: { examYear: "desc" } },
        achievements: { where: { status: "VERIFIED" }, orderBy: { createdAt: "desc" } },
        sessions: { where: { isActive: true }, orderBy: { priceInPaise: "asc" } },
        availability: { orderBy: { dayOfWeek: "asc" } },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            student: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!mentor || mentor.status !== "APPROVED") {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    return NextResponse.json({ mentor });
  } catch (error) {
    console.error("[mentor/[mentorId]] GET error:", error);
    return NextResponse.json({ error: "Failed to load mentor" }, { status: 500 });
  }
}
