/**
 * /mentor-dashboard — legacy redirect shim.
 *
 * The old monolithic dashboard is superseded by /mentor-studio (which has
 * individual focused pages per section).  This page now redirects everyone
 * to the right place based on their current mentor status so old bookmarks
 * and any links in emails/notifications still work.
 */
import { redirect } from "next/navigation";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";

export default async function MentorDashboardRedirectPage() {
  const status = await getUserMentorStatus();

  if (!status) redirect("/sign-in");

  switch (status.mentorStatus) {
    case "APPROVED":
      redirect("/mentor-studio");

    case "PENDING_REVIEW":
      redirect("/mentor-connect?status=pending");

    case "REJECTED":
    case "DRAFT":
      redirect("/mentor-connect/become-mentor");

    case "SUSPENDED":
      redirect("/mentor-connect?status=suspended");

    default:
      // No profile at all
      redirect("/mentor-connect/become-mentor");
  }
}
