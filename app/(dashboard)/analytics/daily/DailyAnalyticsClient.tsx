"use client";

import { useEffect, useState } from "react";
import DailyAnalytics from "./DailyAnalytics";

export default function DailyAnalyticsClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/daily")
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0A0F1E] p-8 text-center text-slate-400">
        Loading daily analytics...
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
        {data?.error ?? "Unable to load daily analytics."}
      </div>
    );
  }

  return <DailyAnalytics data={data} />;
}