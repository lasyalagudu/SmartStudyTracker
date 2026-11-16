import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MyBookingsClient from "./MyBookingsClient";

export const metadata: Metadata = { title: "My Bookings | SmartStudy Tracker" };

export default async function MyBookingsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/onboarding");

  const bookings = await prisma.mentorBooking.findMany({
    where: { studentId: user.id },
    orderBy: { scheduledAt: "desc" },
    include: {
      mentor: {
        select: {
          id: true, headline: true, photoUrl: true, primaryExam: true,
          user: { select: { name: true } },
        },
      },
      session: { select: { title: true, durationMins: true } },
      payment: { select: { status: true } },
      review:  { select: { id: true, rating: true } },
    },
  });

  return <MyBookingsClient bookings={bookings as never} />;
}
