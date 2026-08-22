import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Settings | SmartStudy Tracker",
  description: "Manage your exam setup, study goals, profile, and notification preferences.",
};
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      exams: {
        include: {
          subjects: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) redirect("/onboarding");

  const activeExam =
    user.exams.find((exam) => exam.isActive) ?? user.exams[0] ?? null;

  return (
    <SettingsClient
      profile={user}
      exams={user.exams}
      activeExam={activeExam}
    />
  );
}