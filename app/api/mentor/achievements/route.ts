/**
 * GET  /api/mentor/achievements  — list mentor's own achievements
 * POST /api/mentor/achievements  — add a new achievement (with optional file URL)
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const achievementSchema = z.object({
  title:       z.string().min(3).max(200),
  description: z.string().max(500).default(""),
  fileUrl:     z.string().url().optional().nullable(),
  fileType:    z.enum(["pdf", "image"]).optional().nullable(),
});

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ achievements: [] });

    const mentor = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
    if (!mentor) return NextResponse.json({ achievements: [] });

    const achievements = await prisma.mentorAchievement.findMany({
      where: { mentorId: mentor.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error("[achievements] GET:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const mentor = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
    if (!mentor) return NextResponse.json({ error: "No mentor profile" }, { status: 404 });

    const body = await req.json();
    const parsed = achievementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const achievement = await prisma.mentorAchievement.create({
      data: { mentorId: mentor.id, ...parsed.data },
    });

    return NextResponse.json({ success: true, achievement }, { status: 201 });
  } catch (error) {
    console.error("[achievements] POST:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
