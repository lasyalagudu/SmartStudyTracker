import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MistakesClient from "./MistakesClient";

export const metadata: Metadata = {
  title: "Mistakes Book | SmartStudy Tracker",
  description: "Log and revisit your mistakes to avoid repeating them in the actual exam.",
};

const PAGE_SIZE = 50;

export default async function MistakesPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
  if (!user) redirect("/onboarding");

  // Run exam + mistakes queries in parallel.
  const [activeExam, mistakes, totalCount] = await Promise.all([
    prisma.exam.findFirst({
      where: { userId: user.id, isActive: true },
      include: { subjects: { orderBy: { order: "asc" } } },
    }),

    // Cap the initial load to PAGE_SIZE rows so the page doesn't slow down
    // when a student has hundreds of logged mistakes.
    prisma.mistake.findMany({
      where: { userId: user.id },
      include: { subject: true, topic: true },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    }),

    // Count separately so the client knows whether to show "Load more".
    prisma.mistake.count({ where: { userId: user.id } }),
  ]);

  return (
    <MistakesClient
      mistakes={mistakes}
      subjects={activeExam?.subjects ?? []}
      totalCount={totalCount}
      pageSize={PAGE_SIZE}
    />
  );
}
