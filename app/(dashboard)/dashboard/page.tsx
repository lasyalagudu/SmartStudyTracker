import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Dashboard | SmartStudy Tracker",
  description: "Your daily study overview — tasks, progress, streak, and study time at a glance.",
};
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/sign-in");

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) redirect("/sign-in");

  // Only write to DB when the user doesn't exist yet — avoid an upsert (write)
  // on every single page visit which was causing unnecessary DB load.
  let profile = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!profile) {
    profile = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name: clerkUser.fullName,
      },
    });
  } else if (profile.email !== email || profile.name !== clerkUser.fullName) {
    // Only update when something actually changed (e.g. user renamed in Clerk)
    profile = await prisma.user.update({
      where: { id: profile.id },
      data: { email, name: clerkUser.fullName },
    });
  }

  if (!profile.onboardingCompleted) redirect("/onboarding");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Run all three independent queries in parallel instead of sequentially.
  // This cuts the server-side wait time to the slowest single query.
  const [exam, tasks, sessions] = await Promise.all([
    prisma.exam.findFirst({
      where: { userId: profile.id, isActive: true },
      include: {
        subjects: {
          include: {
            topics: { orderBy: { order: "asc" } },
          },
          orderBy: { order: "asc" },
        },
      },
    }),

    prisma.task.findMany({
      where: {
        userId: profile.id,
        dueDate: { gte: todayStart, lte: todayEnd },
      },
      include: { subject: true, topic: true },
      orderBy: { createdAt: "asc" },
    }),

    prisma.timerSession.findMany({
      where: {
        userId: profile.id,
        sessionType: "FOCUS",
        completed: true,
        startedAt: { gte: todayStart, lte: todayEnd },
      },
      select: { durationMinutes: true },
    }),
  ]);

  if (!exam) redirect("/onboarding");

  const todayMinutes = sessions.reduce(
    (acc, s) => acc + s.durationMinutes,
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
