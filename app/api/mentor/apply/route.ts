/**
 * POST /api/mentor/apply
 * Creates or updates a mentor application (DRAFT → PENDING_REVIEW).
 * Auth required. One MentorProfile per user.
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const applySchema = z.object({
  headline: z.string().min(10).max(200),
  about: z.string().min(30).max(2000),
  photoUrl: z.string().url().optional().nullable(),
  primaryExam: z.string().min(2).max(50),
  college: z.string().min(2).max(200),
  languages: z.array(z.string()).min(1).max(10),
  experienceYears: z.number().int().min(0).max(40),
  linkedinUrl: z.string().url().optional().nullable(),
  // Exams sub-records
  exams: z.array(z.object({
    examName: z.string().min(2).max(100),
    examYear: z.number().int().min(1990).max(2030),
    rank: z.string().optional().nullable(),
    score: z.string().optional().nullable(),
    college: z.string().optional().nullable(),
    description: z.string().max(300).default(""),
  })).min(1),
  // Whether to submit for review or just save draft
  submit: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const { exams, submit, ...profileData } = parsed.data;

    // Upsert the mentor profile
    const existing = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });

    // Don't allow re-applying if suspended or already approved
    if (existing?.status === "SUSPENDED") {
      return NextResponse.json({ error: "Account suspended. Contact support." }, { status: 403 });
    }
    if (existing?.status === "APPROVED" && submit) {
      // Allow updating profile without going back to pending
    }

    const newStatus = submit ? "PENDING_REVIEW" : "DRAFT";


    const mentor = await prisma.$transaction(async (tx) => {
      const profile = existing
        ? await tx.mentorProfile.update({
          where: { userId: user.id },
          data: {
            ...profileData,
            ...(submit &&
              (existing.status === "DRAFT" || existing.status === "REJECTED")
              ? { status: "PENDING_REVIEW" as const }
              : {}),
          },
        })
        : await tx.mentorProfile.create({
          data: {
            userId: user.id,
            ...profileData,
            status: submit ? "PENDING_REVIEW" : "DRAFT",
          },
        });

      // Replace exam entries
      await tx.mentorExam.deleteMany({
        where: { mentorId: profile.id },
      });

      await tx.mentorExam.createMany({
        data: exams.map((e) => ({
          mentorId: profile.id,
          ...e,
        })),
      });

      // Clear mentor signup intent only after successful submission
      if (submit) {
        await tx.user.update({
          where: { id: user.id },
          data: { mentorSignupIntent: false },
        });
      }

      return profile;
    });


    return NextResponse.json({ success: true, mentor });
  } catch (error) {
    console.error("[mentor/apply] POST error:", error);
    return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
  }
}
