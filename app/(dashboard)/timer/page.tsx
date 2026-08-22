import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Study Timer | SmartStudy Tracker",
  description: "Pomodoro and focus timer with subject tracking to log every study session.",
};
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TimerClient from "./TimerClient";

export default async function TimerPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) redirect("/onboarding");

  const exam = await prisma.exam.findFirst({
    where: { userId: user.id, isActive: true },
    include: {
      subjects: {
        orderBy: { order: "asc" },
      },
    },
  });

  return (
    <TimerClient
      subjects={exam?.subjects ?? []}
      dailyGoalMinutes={user.dailyStudyGoalMinutes ?? 360}
    />
  );
}