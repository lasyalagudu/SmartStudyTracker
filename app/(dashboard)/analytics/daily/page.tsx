/**
 * Stand-alone /analytics/daily route (direct URL visit).
 *
 * Previously this called fetch("http://localhost:3000/api/analytics/daily")
 * which broke in production (wrong host) and added an unnecessary internal
 * HTTP round-trip. Now it calls the shared server function directly.
 */
import { redirect } from "next/navigation";
import { getDailyAnalytics } from "@/lib/analytics/getDailyAnalytics";
import DailyAnalytics from "./DailyAnalytics";

export default async function DailyAnalyticsPage() {
  let data;

  try {
    data = await getDailyAnalytics();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") redirect("/sign-in");
    if (message === "User not found") redirect("/onboarding");
    // For "No active exam found" or unexpected errors, show a fallback
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center text-red-400">
        {message || "Failed to load daily analytics. Please try again."}
      </div>
    );
  }

  return <DailyAnalytics data={data} />;
}
