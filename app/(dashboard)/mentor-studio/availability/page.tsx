import type { Metadata } from "next";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AvailabilityClient from "./AvailabilityClient";

export const metadata: Metadata = { title: "Availability | Mentor Studio" };

export default async function AvailabilityPage() {
  const status = await getUserMentorStatus();
  if (!status) redirect("/sign-in");

  const mentor = await prisma.mentorProfile.findUnique({
    where: { userId: status.userId },
    select: { id: true },
  });
  if (!mentor) redirect("/mentor-connect/become-mentor");

  const [availability, blockedDates] = await Promise.all([
    prisma.mentorAvailability.findMany({
      where:   { mentorId: mentor.id },
      orderBy: { dayOfWeek: "asc" },
    }),
    prisma.mentorBlockedDate.findMany({
      where:   { mentorId: mentor.id, date: { gte: new Date() } },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <AvailabilityClient
      availability={availability as never}
      blockedDates={blockedDates.map((b) => ({
        date:   b.date.toISOString().split("T")[0],
        reason: b.reason ?? "",
      }))}
    />
  );
}
