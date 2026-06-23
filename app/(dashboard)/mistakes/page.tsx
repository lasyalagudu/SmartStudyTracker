import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MistakesClient from "./MistakesClient";

export default async function MistakesPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) redirect("/onboarding");

  const activeExam = await prisma.exam.findFirst({
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

  const mistakes = await prisma.mistake.findMany({
    where: {
      userId: user.id,
    },
    include: {
      subject: true,
      topic: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <MistakesClient
      mistakes={mistakes}
      subjects={activeExam?.subjects ?? []}
    />
  );
}