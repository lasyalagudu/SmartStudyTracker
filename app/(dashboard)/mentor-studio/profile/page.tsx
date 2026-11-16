import type { Metadata } from "next";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = { title: "My Profile | Mentor Studio" };

export default async function ProfilePage() {
  const status = await getUserMentorStatus();
  if (!status) redirect("/sign-in");

  const mentor = await prisma.mentorProfile.findUnique({
    where: { userId: status.userId },
    include: {
      exams:        { orderBy: { examYear: "desc" } },
      achievements: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!mentor) redirect("/mentor-connect/become-mentor");

  return <ProfileClient mentor={mentor as never} userName={status.name} />;
}
