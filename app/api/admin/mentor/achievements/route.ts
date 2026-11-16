/**
 * PATCH /api/admin/mentor/achievements
 * Admin approves or rejects individual achievement certificates.
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  achievementId: z.string().uuid(),
  action:        z.enum(["VERIFY", "REJECT"]),
  adminNote:     z.string().max(300).optional().nullable(),
});


export async function PATCH(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { achievementId, action, adminNote } = parsed.data;

    const achievement = await prisma.mentorAchievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      );
    }

    if (achievement.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Achievement is already ${achievement.status}`,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.mentorAchievement.update({
      where: { id: achievementId },
      data: {
        status: action === "VERIFY" ? "VERIFIED" : "REJECTED",
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      achievement: updated,
    });
  } catch (error) {
    console.error("[admin/achievements] PATCH:", error);

    return NextResponse.json(
      { error: "Failed to update achievement" },
      { status: 500 }
    );
  }
}
