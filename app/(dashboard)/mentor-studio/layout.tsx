/**
 * app/(dashboard)/mentor-studio/layout.tsx
 *
 * Server-side APPROVED guard for all Mentor Studio pages.
 * Anyone who isn't an approved mentor is redirected immediately —
 * this runs before any child page renders.
 *
 * The studio lives inside the existing (dashboard) group so it
 * inherits the same sidebar/header shell automatically.
 */
import { redirect } from "next/navigation";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";

export default async function MentorStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await getUserMentorStatus();

  // Not logged in or no DB record → send to sign-in
  if (!status) {
    redirect("/sign-in");
  }

  // Has a profile but not approved yet → send to relevant page
  if (!status.isApprovedMentor) {
    if (status.mentorStatus === "PENDING_REVIEW") {
      // Show them their pending status on the connect page
      redirect("/mentor-connect?status=pending");
    }
    if (
      status.mentorStatus === "REJECTED" ||
      status.mentorStatus === "DRAFT" ||
      !status.hasMentorProfile
    ) {
      redirect("/mentor-connect/become-mentor");
    }
    if (status.mentorStatus === "SUSPENDED") {
      redirect("/mentor-connect?status=suspended");
    }
    // Fallback
    redirect("/mentor-connect");
  }

  return <>{children}</>;
}
