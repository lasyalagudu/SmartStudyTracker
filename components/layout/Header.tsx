import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import  HeaderClient from "./HeaderClient";

export default async function Header() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: clerkUser.id,
    },
    include: {
      exams: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const activeExam =
    user.exams.find((exam) => exam.isActive) ?? user.exams[0] ?? null;

  return (
    <HeaderClient
      profile={user}
      exams={user.exams}
      activeExam={activeExam}
    />
  );
}