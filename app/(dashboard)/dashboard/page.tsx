import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/sign-in");

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) redirect("/sign-in");

  const profile = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      name: clerkUser.fullName,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      name: clerkUser.fullName,
    },
  });

  const exam = await prisma.exam.findFirst({
    where: {
      userId: profile.id,
      isActive: true,
    },
    include: {
      subjects: {
        include: {
          topics: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!profile.onboardingCompleted || !exam) {
    redirect("/onboarding");
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      userId: profile.id,
      examId: exam.id,
      dueDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: {
      subject: true,
      topic: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const sessions = await prisma.timerSession.findMany({
    where: {
      userId: profile.id,
      sessionType: "FOCUS",
      completed: true,
      startedAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    select: {
      durationMinutes: true,
    },
  });

  const todayMinutes = sessions.reduce(
    (acc, session) => acc + session.durationMinutes,
    0
  );

  return (
    <DashboardClient
      profile={profile}
      exam={exam}
      subjects={exam.subjects}
      tasks={tasks}
      todayMinutes={todayMinutes}
    />
  );
}