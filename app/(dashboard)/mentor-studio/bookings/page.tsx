import type { Metadata } from "next";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BookingsClient from "./BookingsClient";

export const metadata: Metadata = { title: "Bookings | Mentor Studio" };

export default async function BookingsPage() {
  const status = await getUserMentorStatus();
  if (!status) redirect("/sign-in");

  const mentor = await prisma.mentorProfile.findUnique({
    where:  { userId: status.userId },
    select: { id: true },
  });
  if (!mentor) redirect("/mentor-connect/become-mentor");

  const bookings = await prisma.mentorBooking.findMany({
    where:   { mentorId: mentor.id },
    orderBy: { scheduledAt: "desc" },
    take:    100,
    include: {
      student: { select: { name: true, email: true } },
      session: { select: { title: true, durationMins: true } },
      payment: { select: { status: true } },
      review:  { select: { rating: true } },
    },
  });

  return <BookingsClient bookings={bookings as never} />;
}
