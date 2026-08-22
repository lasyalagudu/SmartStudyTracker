import type { Metadata } from "next";
import ProPageClient from "./ProPageClient";

export const metadata: Metadata = {
  title: "Pro Plan | SmartStudy Tracker",
  description:
    "Get early access to SmartStudy Tracker Pro — advanced analytics, revision reminders, unlimited subjects, and detailed performance reports.",
};

export default function ProPage() {
  return <ProPageClient />;
}
