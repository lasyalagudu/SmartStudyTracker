import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateNextStreak } from "@/lib/streak";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    const task = await prisma.task.update({
      where: { id, userId: user.id },
      data: {
        completed: body.completed,
        completedAt: body.completed ? new Date() : null,
      },
      include: {
        subject: true,
        topic: true,
      },
    });

    // ── When a task is completed, update the linked topic status ─────────────
    // This is what connects the planner to the syllabus tracker.
    // - Completing a "📖 Study" task → topic moves to IN_PROGRESS (if NOT_STARTED)
    // - Completing a "📝 Revise" task → updates topic.lastRevisedAt
    // - Un-completing a task → no rollback (don't regress syllabus progress)
    if (body.completed === true && task.topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: task.topicId },
      });

      if (topic) {
        const isRevision = task.title?.startsWith("📝 Revise");

        if (isRevision) {
          // Mark revision as done and update lastRevisedAt
          await prisma.topic.update({
            where: { id: topic.id },
            data: {
              revisionDone: true,
              lastRevisedAt: new Date(),
            },
          });
        } else if (topic.status === "NOT_STARTED") {
          // First time studying this topic — move it to IN_PROGRESS
          await prisma.topic.update({
            where: { id: topic.id },
            data: {
              status: "IN_PROGRESS",
            },
          });
        }
        // If already IN_PROGRESS or COMPLETED — don't change it here.
        // The student should update it manually in Syllabus Tracker once fully done.
      }
    }

    // ── Update streak only when completing (not un-completing) ───────────────
    if (body.completed === true) {
      const nextStreak = calculateNextStreak(
        user.streakCount,
        user.lastStudyDate
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          streakCount: nextStreak.streakCount,
          lastStudyDate: nextStreak.lastStudyDate,
        },
      });
    }

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
