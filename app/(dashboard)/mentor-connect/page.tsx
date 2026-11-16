import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";
import { prisma } from "@/lib/prisma";
import MentorConnectClient from "./MentorConnectClient";

export const metadata: Metadata = {
  title: "Mentor Connect | SmartStudy Tracker",
  description: "Find verified mentors who cleared your exam and book 1-on-1 sessions.",
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function MentorConnectPage({ searchParams }: PageProps) {
  const mentorStatus = await getUserMentorStatus();
  if (!mentorStatus) redirect("/sign-in");

  // Approved mentors who land here via the sidebar "Mentor Connect" link
  // should still see the discovery page — they may want to browse other mentors.
  // Only redirect to studio if they explicitly visit /mentor-connect after
  // already being in studio mode (this avoids a redirect loop).

  const { status: queryStatus } = await searchParams;

  // Active exam for pre-filtering the mentor listing
  const activeExam = await prisma.exam.findFirst({
    where:  { userId: mentorStatus.userId, isActive: true },
    select: { name: true },
  });

  return (
    <MentorConnectClient
      userId={mentorStatus.userId}
      activeExamName={activeExam?.name ?? null}
      hasMentorProfile={mentorStatus.hasMentorProfile}
      mentorProfileStatus={mentorStatus.mentorStatus}
      isApprovedMentor={mentorStatus.isApprovedMentor}
      // Pass along the ?status query param so the client can show the
      // right banner when redirected here from mentor-studio layout guards
      statusNotice={queryStatus ?? null}
    />
  );
}
