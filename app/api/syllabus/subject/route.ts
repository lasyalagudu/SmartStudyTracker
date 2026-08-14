import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkUser.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { examId, name, color, order } = body;

    if (!examId || !name) {
      return NextResponse.json(
        { error: "Exam and subject name are required" },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: user.id,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const subject = await prisma.subject.create({
      data: {
        examId,
        name,
        color: color || "#7C3AED",
        order: order ?? 0,
      },
    });

    return NextResponse.json({ subject });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}