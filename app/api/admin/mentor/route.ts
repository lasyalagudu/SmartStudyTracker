/**
 * GET   /api/admin/mentor  — list all mentor applications (admin only)
 * PATCH /api/admin/mentor  — approve / reject / suspend a mentor (admin only)
 *
 * Admin check: user.role === "ADMIN" — set directly in DB, never via client API.
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function getAdminUser(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await getAdminUser(clerkUser.id);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;

    const mentors = await prisma.mentorProfile.findMany({
      where: status ? { status: status as never } : {},
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        exams: true,
        achievements: { orderBy: { createdAt: "desc" } },
        _count: { select: { bookings: true, reviews: true } },
      },
    });

    return NextResponse.json({ mentors });
  } catch (error) {
    console.error("[admin/mentor] GET:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

const actionSchema = z.object({
  mentorId:  z.string().uuid(),
  action:    z.enum(["APPROVE", "REJECT", "SUSPEND", "UNSUSPEND"]),
  adminNote: z.string().max(500).optional().nullable(),
});


export async function PATCH(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await getAdminUser(clerkUser.id);

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { mentorId, action, adminNote } = parsed.data;

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      return NextResponse.json(
        { error: "Mentor not found" },
        { status: 404 }
      );
    }

    const allowedTransitions: Record<string, string[]> = {
      APPROVE: ["PENDING_REVIEW", "REJECTED"],
      REJECT: ["PENDING_REVIEW"],
      SUSPEND: ["APPROVED"],
      UNSUSPEND: ["SUSPENDED"],
    };

    if (!allowedTransitions[action].includes(mentor.status)) {
      return NextResponse.json(
        {
          error: `Cannot perform ${action} when mentor status is ${mentor.status}`,
        },
        { status: 409 }
      );
    }

    const statusMap = {
      APPROVE: "APPROVED",
      REJECT: "REJECTED",
      SUSPEND: "SUSPENDED",
      UNSUSPEND: "APPROVED",
    } as const;

    const updated = await prisma.mentorProfile.update({
      where: { id: mentorId },
      data: {
        status: statusMap[action],
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
    });

    return NextResponse.json({ success: true, mentor: updated });
  } catch (error) {
    console.error("[admin/mentor] PATCH:", error);

    return NextResponse.json(
      { error: "Failed to update mentor" },
      { status: 500 }
    );
  }
}
