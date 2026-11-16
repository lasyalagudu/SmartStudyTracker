/**
 * GET /api/mentor
 * Returns approved mentors, optionally filtered by exam.
 * Used by the discovery page.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const exam    = searchParams.get("exam") ?? undefined;
    const search  = searchParams.get("search") ?? undefined;
    const sort    = searchParams.get("sort") ?? "rating";
    const minRating = parseFloat(searchParams.get("minRating") ?? "0");
    const maxPrice  = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) * 100 : undefined;

    const mentors = await prisma.mentorProfile.findMany({
      where: {
        status: "APPROVED",
        ...(exam ? { primaryExam: { contains: exam, mode: "insensitive" } } : {}),
        ...(minRating > 0 ? { avgRating: { gte: minRating } } : {}),
        ...(search ? {
          OR: [
            { user: { name: { contains: search, mode: "insensitive" } } },
            { headline: { contains: search, mode: "insensitive" } },
            { college: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
        ...(maxPrice ? { sessions: { some: { priceInPaise: { lte: maxPrice }, isActive: true } } } : {}),
      },
      include: {
        user: { select: { name: true, email: true } },
        exams: { select: { id: true, examName: true, examYear: true, rank: true, score: true, college: true } },
        sessions: { where: { isActive: true }, select: { id: true, title: true, durationMins: true, priceInPaise: true } },
        achievements: { where: { status: "VERIFIED" }, select: { id: true, status: true } },
        _count: { select: { reviews: true, bookings: true } },
      },
      orderBy: sort === "price"
        ? { sessions: { _count: "asc" } }
        : sort === "sessions"
        ? { totalSessions: "desc" }
        : { avgRating: "desc" },
      take: 50,
    });

    return NextResponse.json({ mentors });
  } catch (error) {
    console.error("[mentor] GET error:", error);
    return NextResponse.json({ error: "Failed to load mentors" }, { status: 500 });
  }
}
