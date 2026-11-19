import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";
import { prisma } from "@/lib/prisma";
import InboxClient from "./InboxClient";

export const metadata: Metadata = { title: "Inbox | Mentor Studio" };

export default async function InboxPage() {
  const status = await getUserMentorStatus();
  if (!status) redirect("/sign-in");

  const mentor = await prisma.mentorProfile.findUnique({
    where: { userId: status.userId },
    select: { id: true },
  });
  if (!mentor) redirect("/mentor-connect/become-mentor");

  // Load all unique threads with latest message + unread count
  const threads = await prisma.mentorMessage.findMany({
    where: { mentorId: mentor.id },
    orderBy: { createdAt: "desc" },
    distinct: ["studentId"],
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
  });

  const threadsWithMeta = await Promise.all(
    threads.map(async (t) => {
      const unread = await prisma.mentorMessage.count({
        where: { mentorId: mentor.id, studentId: t.studentId, read: false, senderId: t.studentId },
      });
      return {
        student: t.student,
        lastMessage: t.content,
        lastAt: t.createdAt.toISOString(),
        unread,
      };
    })
  );

  return (
    <InboxClient
      mentorId={mentor.id}
      mentorUserId={status.userId}
      threads={threadsWithMeta}
    />
  );
}
