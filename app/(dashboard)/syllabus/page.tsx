import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Syllabus Tracker | SmartStudy Tracker",
  description: "Track theory, problems, PYQs, and revision status for every topic in your syllabus.",
};
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SyllabusClient from "./SyllabusClient";

export default async function SyllabusPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: clerkUser.id,
    },
  });

  if (!user) {
    redirect("/onboarding");
  }

  const exam = await prisma.exam.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
    include: {
      subjects: {
        include: {
          topics: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!exam) {
    redirect("/onboarding");
  }

  return (
    <SyllabusClient
      userId={user.id}
      exam={exam}
      subjects={exam.subjects}
    />
  );
}