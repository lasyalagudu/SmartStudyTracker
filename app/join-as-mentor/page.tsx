/**
 * /join-as-mentor
 *
 * Public marketing + signup page for mentor recruitment.
 * Shared on LinkedIn, WhatsApp, etc. with rankers and toppers.
 *
 * Authentication is handled by Clerk SignUp embedded below.
 * After auth, the ?intent=mentor param routes the user to
 * /sso-callback?intent=mentor → /mentor-connect/become-mentor.
 */
import type { Metadata } from "next";
import JoinAsMentorClient from "./JoinAsMentorClient";

export const metadata: Metadata = {
  title: "Become a Mentor | SmartStudy Tracker",
  description:
    "Turn your exam rank into real impact. Guide aspiring students, share your preparation strategies and earn through personalized mentoring.",
};

export default function JoinAsMentorPage() {
  return <JoinAsMentorClient />;
}
