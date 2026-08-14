"use client";

import { useEffect, useState } from "react";
import type { MonthlyAnalytics } from "@/types";

import MonthlyHeader from "./MonthlyHeader";
import MonthlySummaryCards from "./MonthlySummaryCards";
import MonthlyProgressTrend from "./MonthlyProgressTrend";
import MonthlySubjectDistribution from "./MonthlySubjectDistribution";
import MonthlyAchievements from "./MonthlyAchievements";
import MonthlyExamReadiness from "./MonthlyExamReadiness";
import MonthlyGoalCard from "./MonthlyGoalCard";
import MonthlySubjectHighlights from "./MonthlySubjectHighLights";
import MonthlyInsights from "./MonthlyInsights";

export default function MonthlyAnalyticsClient() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyAnalytics | null>(null);
  const [error, setError] = useState("");

  async function loadAnalytics(y: number, m: number) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/analytics/monthly?year=${y}&month=${m}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load monthly analytics");
        return;
      }

      setData(json);
    } catch {
      setError("Something went wrong while loading monthly analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics(year, month);
  }, [year, month]);

  if (loading) {
    return (
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-10 text-center text-slate-400">
        Loading monthly analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#0A0F1E] border border-red-500/20 rounded-2xl p-10 text-center">
        <h3 className="text-white font-semibold">Unable to load analytics</h3>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MonthlyHeader
        year={year}
        month={month}
        setYear={setYear}
        setMonth={setMonth}
      />

      <MonthlySummaryCards
        totalMinutes={data.stats.totalMinutes}
        totalSessions={data.stats.totalSessions}
        topicsCompleted={data.stats.topicsCompletedThisMonth}
        consistency={data.stats.consistency}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MonthlyProgressTrend weeklyTrend={data.weeklyTrend} />

        <MonthlySubjectDistribution
          subjects={data.subjectDistribution}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MonthlyAchievements achievements={data.achievements} />

        <MonthlyExamReadiness
          overallProgress={data.stats.overallProgress}
          completedTopics={data.stats.completedTopics}
          totalTopics={data.stats.totalTopics}
          consistency={data.stats.consistency}
          monthlyGoalPercent={data.stats.monthlyGoalPercent}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MonthlyGoalCard
          totalMinutes={data.stats.totalMinutes}
          monthlyGoalMinutes={data.stats.monthlyGoalMinutes}
          monthlyGoalPercent={data.stats.monthlyGoalPercent}
        />

        <MonthlySubjectHighlights
          bestSubject={data.bestSubject}
          weakSubject={data.weakSubject}
        />
      </div>

      <MonthlyInsights insight={data.insight} />
    </div>
  );
}