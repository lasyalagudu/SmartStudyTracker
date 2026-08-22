"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import WeeklyStatsCards from "./WeeklyStatsCards";
import WeeklyStudyTrend from "./WeeklyStudyTrend";
import WeeklyGoalProgress from "./WeeklyGoalProgress";
import WeeklyHeatmap from "./WeeklyHeatmap";
import WeeklySubjectProgress from "./WeeklySubjectProgress";
import WeeklyStudyDistribution from "./WeeklyStudyDistribution";
import StrongWeakSubjects from "./StrongWeakSubjects";
import WeeklyInsights from "./WeeklyInsights";
import WeeklySummary from "./WeeklySummary";

interface WeeklyAnalyticsData {
  exam: {
    id: string;
    name: string;
    targetDate: string | null;
  };

  range: {
    weekStart: string;
    weekEnd: string;
  };

  stats: {
    totalMinutes: number;
    totalSessions: number;
    averageDailyMinutes: number;
    weeklyGoalMinutes: number;
    weeklyGoalPercent: number;
    activeStudyDays: number;
    consistency: number;
    bestStudyDay: string;
    streakCount: number;
    overallProgress: number;
    totalTopics: number;
    completedTopics: number;
  };

  weeklyMinutes: number[];

  heatmapDays: {
    date: string;
    minutes: number;
  }[];

  subjectProgress: {
    id: string;
    name: string;
    color: string;
    totalTopics: number;
    completedTopics: number;
    progress: number;
    minutes: number;
  }[];

  subjectStudyTime: {
    id: string;
    name: string;
    color: string;
    minutes: number;
  }[];

  strongSubject: {
    id: string;
    name: string;
    color: string;
    minutes: number;
  } | null;

  weakSubject: {
    id: string;
    name: string;
    color: string;
    minutes: number;
  } | null;

  insight: string;
}

export default function WeeklyAnalyticsClient() {
  const [data, setData] = useState<WeeklyAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWeeklyAnalytics() {
      try {
        const res = await fetch("/api/analytics/weekly");
        const result = await res.json();

        if (!res.ok) {
          setError(result.error || "Failed to load weekly analytics");
          return;
        }

        setData(result);
      } catch {
        setError("Something went wrong while loading analytics");
      } finally {
        setLoading(false);
      }
    }

    loadWeeklyAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 rounded-2xl bg-white/5 border border-white/8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/8" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 h-56 rounded-2xl bg-white/5 border border-white/8" />
          <div className="h-56 rounded-2xl bg-white/5 border border-white/8" />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-48 rounded-2xl bg-white/5 border border-white/8" />
          <div className="h-48 rounded-2xl bg-white/5 border border-white/8" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#0A0F1E] border border-red-500/20 rounded-2xl p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-1">
          Unable to load analytics
        </h3>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  // New user or no study sessions yet this week — show a helpful prompt
  // instead of rendering all the chart components with zero/empty data.
  if (data.stats.totalMinutes === 0 && data.stats.totalSessions === 0) {
    return (
      <div className="space-y-6">
        {/* Exam + range header still shown so context is clear */}
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
          <div className="text-sm text-slate-500">Current Exam</div>
          <div className="text-xl font-bold text-white mt-1">{data.exam.name}</div>
          <div className="text-xs text-slate-500 mt-1">
            Week: {data.range.weekStart} → {data.range.weekEnd}
          </div>
        </div>

        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            No study sessions this week yet
          </h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
            Complete a focus session in the Study Timer and your weekly
            analytics will appear here automatically.
          </p>
          <a
            href="/timer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors"
          >
            Start a Study Session →
          </a>
        </div>
      </div>
    );
  }

  const dailyGoalMinutes = Math.round(data.stats.weeklyGoalMinutes / 7);

  return (
    <div className="space-y-6">
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
        <div className="text-sm text-slate-500">Current Exam</div>
        <div className="text-xl font-bold text-white mt-1">
          {data.exam.name}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Week: {data.range.weekStart} → {data.range.weekEnd}
        </div>
      </div>

      <WeeklyStatsCards stats={data.stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <WeeklyStudyTrend
            weeklyMinutes={data.weeklyMinutes}
            dailyGoalMinutes={dailyGoalMinutes}
          />
        </div>

        <WeeklyGoalProgress
          totalMinutes={data.stats.totalMinutes}
          weeklyGoalMinutes={data.stats.weeklyGoalMinutes}
          weeklyGoalPercent={data.stats.weeklyGoalPercent}
        />
      </div>

      {/* <WeeklyHeatmap heatmapDays={data.heatmapDays} /> */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <WeeklySubjectProgress subjects={data.subjectProgress} />
        <WeeklyStudyDistribution subjects={data.subjectStudyTime} />
      </div>

      <StrongWeakSubjects
        strongSubject={data.strongSubject}
        weakSubject={data.weakSubject}
      />

      <WeeklyInsights
        insight={data.insight}
        stats={{
          totalMinutes: data.stats.totalMinutes,
          weeklyGoalPercent: data.stats.weeklyGoalPercent,
          consistency: data.stats.consistency,
          activeStudyDays: data.stats.activeStudyDays,
        }}
        weakSubject={data.weakSubject}
      />

      <WeeklySummary
        stats={{
          bestStudyDay: data.stats.bestStudyDay,
          averageDailyMinutes: data.stats.averageDailyMinutes,
          activeStudyDays: data.stats.activeStudyDays,
          consistency: data.stats.consistency,
        }}
      />
    </div>
  );
}