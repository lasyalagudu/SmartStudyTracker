import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
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

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  const exam = await prisma.exam.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
    include: {
      subjects: {
        orderBy: { order: "asc" },
      },
    },
  });

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      dueDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      subject: true,
      topic: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json({
    userId: user.id,
    examId: exam?.id ?? "",
    subjects: exam?.subjects ?? [],
    tasks,
  });
}