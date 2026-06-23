import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

  const exam = await prisma.exam.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
    include: {
      subjects: {
        include: {
          topics: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  const sessions = await prisma.timerSession.findMany({
    where: {
      userId: user.id,
      completed: true,
    },
    select: {
      durationMinutes: true,
    },
  });

  const totalMinutes = sessions.reduce(
    (acc, session) => acc + session.durationMinutes,
    0
  );

  return NextResponse.json({
    subjects: exam?.subjects ?? [],
    totalSessions: sessions.length,
    totalMinutes,
  });
}