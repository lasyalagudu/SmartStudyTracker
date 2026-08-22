import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | SmartStudy Tracker",
  description: "Daily, weekly, monthly, and subject-wise analytics to measure your exam preparation.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
