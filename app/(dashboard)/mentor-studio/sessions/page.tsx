import type { Metadata } from "next";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SessionsClient from "./SessionsClient";

export const metadata: Metadata = { title: "Sessions | Mentor Studio" };

export default async function SessionsPage() {
  const status = await getUserMentorStatus();
  if (!status) redirect("/sign-in");

  const mentor = await prisma.mentorProfile.findUnique({
    where:   { userId: status.userId },
    select:  { id: true },
  });
  if (!mentor) redirect("/mentor-connect/become-mentor");

  const sessions = await prisma.mentorSession.findMany({
    where:   { mentorId: mentor.id },
    orderBy: { priceInPaise: "asc" },
    include: { _count: { select: { bookings: true } } },
  });

  return <SessionsClient sessions={sessions as never} />;
}
