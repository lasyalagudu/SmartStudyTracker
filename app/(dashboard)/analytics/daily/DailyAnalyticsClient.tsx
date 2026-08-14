"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import DailyAnalytics from "./DailyAnalytics";

function DailyAnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/5 border border-white/8"
          />
        ))}
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-white/5 border border-white/8"
          />
        ))}
      </div>

      {/* Insight card */}
      <div className="h-24 rounded-2xl bg-white/5 border border-white/8" />
    </div>
  );
}

export default function DailyAnalyticsClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analytics/daily");
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Unable to load daily analytics.");
        return;
      }

      setData(json);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <DailyAnalyticsSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return <DailyAnalytics data={data} />;
}
