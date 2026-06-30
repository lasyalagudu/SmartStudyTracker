import DailyAnalytics from "./DailyAnalytics";

async function getDailyAnalytics() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/analytics/daily`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch daily analytics");
  }

  return res.json();
}

export default async function DailyAnalyticsPage() {
  const data = await getDailyAnalytics();

  return <DailyAnalytics data={data} />;
}