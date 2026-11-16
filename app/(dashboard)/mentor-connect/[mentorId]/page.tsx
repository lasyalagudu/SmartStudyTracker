import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MentorProfileClient from "./MentorProfileClient";

interface Props { params: Promise<{ mentorId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mentorId } = await params;
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
    include: { user: { select: { name: true } } },
  });
  if (!mentor) return { title: "Mentor Not Found" };
  return {
    title: `${mentor.user.name ?? "Mentor"} | Mentor Connect`,
    description: mentor.headline,
  };
}

export default async function MentorProfilePage({ params }: Props) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const { mentorId } = await params;

  const [user, mentor] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: clerkUser.id } }),
    prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      include: {
        user:         { select: { name: true, email: true } },
        exams:        { orderBy: { examYear: "desc" } },
        achievements: { where: { status: "VERIFIED" }, orderBy: { createdAt: "desc" } },
        sessions:     { where: { isActive: true }, orderBy: { priceInPaise: "asc" } },
        availability: { orderBy: { dayOfWeek: "asc" } },
        reviews:      {
          orderBy:  { createdAt: "desc" },
          take:     10,
          include:  { student: { select: { name: true } } },
        },
      },
    }),
  ]);

  if (!user) redirect("/onboarding");
  if (!mentor || mentor.status !== "APPROVED") notFound();

  return <MentorProfileClient mentor={mentor as never} studentId={user.id} />;
}
