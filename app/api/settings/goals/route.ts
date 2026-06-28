import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
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

    const { dailyStudyGoalMinutes, dailyTaskGoal } = await req.json();

    if (dailyStudyGoalMinutes <= 0 || dailyTaskGoal <= 0) {
      return NextResponse.json(
        { error: "Goals must be greater than 0" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyStudyGoalMinutes,
        dailyTaskGoal,
      },
    });

    return NextResponse.json({
      success: true,
      dailyStudyGoalMinutes,
      dailyTaskGoal,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update goals" },
      { status: 500 }
    );
  }
}