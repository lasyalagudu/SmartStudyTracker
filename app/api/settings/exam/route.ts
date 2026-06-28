import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkUser.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const exam = await prisma.exam.update({
      where: {
        id: body.examId,
      },
      data: {
        name: body.name,
        targetDate: body.targetDate
          ? new Date(body.targetDate)
          : null,
      },
    });

    return NextResponse.json({ exam });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    );
  }
}