/**
 * GET  /api/mentor/sessions  — list active sessions for current mentor
 * POST /api/mentor/sessions  — create a new session offering
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sessionSchema = z.object({
  title:        z.string().min(5).max(150),
  description:  z.string().max(500).default(""),
  durationMins: z.number().int().min(15).max(480),
  priceInPaise: z.number().int().min(0),
  isActive:     z.boolean().default(true),
});

async function getApprovedMentor(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return null;
  const mentor = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
  if (!mentor || mentor.status !== "APPROVED") return null;
  return { user, mentor };
}

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await getApprovedMentor(clerkUser.id);
    if (!result) return NextResponse.json({ error: "Not an approved mentor" }, { status: 403 });

    const sessions = await prisma.mentorSession.findMany({
      where: { mentorId: result.mentor.id },
      orderBy: { priceInPaise: "asc" },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[mentor/sessions] GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await getApprovedMentor(clerkUser.id);
    if (!result) return NextResponse.json({ error: "Not an approved mentor" }, { status: 403 });

    const body = await req.json();
    const parsed = sessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const session = await prisma.mentorSession.create({
      data: { mentorId: result.mentor.id, ...parsed.data },
    });

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error("[mentor/sessions] POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
