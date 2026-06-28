"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Loader2,
  CalendarDays,
  ChevronDown,
  Flame,
  Star,
  Save,
} from "lucide-react";
import type { Subject } from "@/types";
import { toast } from "sonner";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalSessions, setTotalSessions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState<number[]>([]);
  const [heatmapDays, setHeatmapDays] = useState<any[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [bestStudyDay, setBestStudyDay] = useState("Not yet");

  const [dailyStudyGoalMinutes, setDailyStudyGoalMinutes] = useState(360);
  const [dailyTaskGoal, setDailyTaskGoal] = useState(5);

  const [showGoalsMenu, setShowGoalsMenu] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const res = await fetch("/api/analytics");
    const data = await res.json();

    if (res.ok) {
      setSubjects(data.subjects ?? []);
      setTotalSessions(data.totalSessions ?? 0);
      setTotalMinutes(data.totalMinutes ?? 0);
      setWeeklyMinutes(data.weeklyMinutes ?? []);
      setHeatmapDays(data.heatmapDays ?? []);
      setStreakCount(data.streakCount ?? 0);
      setActiveDays(data.activeDays ?? 0);
      setBestStudyDay(data.bestStudyDay ?? "Not yet");
      setDailyStudyGoalMinutes(data.dailyStudyGoalMinutes ?? 360);
      setDailyTaskGoal(data.dailyTaskGoal ?? 5);
    }

    setLoading(false);
  }

  async function saveGoals() {
    setSavingGoals(true);

    const res = await fetch("/api/settings/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dailyStudyGoalMinutes,
        dailyTaskGoal,
      }),
    });

    const data = await res.json();
    setSavingGoals(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to update goals");
      return;
    }

    toast.success("Study goals updated!");
    setShowGoalsMenu(false);
  }

  const totalTopics = subjects.reduce(
    (acc, s) => acc + (s.topics?.length ?? 0),
    0,
  );

  const completedTopics = subjects.reduce(
    (acc, s) =>
      acc +
      (s.topics?.filter((t) => t.status === "COMPLETED" || t.mastered).length ??
        0),
    0,
  );

  const overallProgress =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const safeWeeklyMinutes =
    weeklyMinutes.length === 7 ? weeklyMinutes : [0, 0, 0, 0, 0, 0, 0];

  const maxMinutes = Math.max(...safeWeeklyMinutes, dailyStudyGoalMinutes, 60);
  const weekTotalMinutes = safeWeeklyMinutes.reduce((a, b) => a + b, 0);
  const goalProgress = Math.min(
    Math.round((weekTotalMinutes / (dailyStudyGoalMinutes * 7)) * 100),
    100,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your study patterns, goals, and subject progress.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0F1E] border border-white/10 rounded-xl text-sm text-slate-300">
          <CalendarDays className="w-4 h-4" />
          This Week
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Overall Progress",
            value: `${overallProgress}%`,
            sub:
              totalTopics > 0
                ? `${completedTopics}/${totalTopics} topics`
                : "No topics yet",
            icon: Target,
            color: "from-violet-500 to-violet-700",
          },
          {
            label: "Topics Completed",
            value: completedTopics,
            sub: `${totalTopics - completedTopics} remaining`,
            icon: TrendingUp,
            color: "from-green-500 to-emerald-700",
          },
          {
            label: "Study Sessions",
            value: totalSessions,
            sub: "Completed focus sessions",
            icon: Clock,
            color: "from-blue-500 to-blue-700",
          },
          {
            label: "Total Study Time",
            value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
            sub: `${activeDays} active study days`,
            icon: BarChart3,
            color: "from-orange-500 to-orange-700",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5"
            >
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="text-3xl font-bold text-white mt-4">
                {stat.value}
              </div>
              <div className="text-sm text-slate-300 mt-1">{stat.label}</div>
              <div className="text-xs text-slate-500 mt-2">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-semibold text-white">Study Time Overview</h3>

              <p className="text-xs text-slate-500 mt-1">
                Weekly goal progress: {goalProgress}%
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Daily Goal</div>

              <div className="text-lg font-semibold text-white">
                {Math.floor(dailyStudyGoalMinutes / 60)}h{" "}
                {dailyStudyGoalMinutes % 60}m
              </div>

              <a
                href="/settings"
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                Edit Goals →
              </a>
            </div>
          </div>

          <div className="h-64 flex items-end gap-4 border-b border-white/10 pb-4">
            {WEEK_DAYS.map((day, i) => {
              const minutes = safeWeeklyMinutes[i] ?? 0;
              const height = Math.max(
                (minutes / maxMinutes) * 100,
                minutes > 0 ? 8 : 2,
              );

              return (
                <div
                  key={day}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="text-xs text-slate-400">
                    {Math.floor(minutes / 60)}h {minutes % 60}m
                  </div>
                  <div
                    className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-violet-700 to-violet-400"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-slate-500">{day}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">
            Subject-wise Progress
          </h3>

          {subjects.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <div>
                No subjects found. Set up your syllabus to see analytics.
              </div>
            </div>
          )}

          <div className="space-y-5">
            {subjects.map((subject) => {
              const total = subject.topics?.length ?? 0;
              const done =
                subject.topics?.filter(
                  (t) => t.status === "COMPLETED" || t.mastered,
                ).length ?? 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div key={subject.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      {subject.name}
                    </span>
                    <span className="text-sm text-slate-400">
                      {pct}% ({done}/{total})
                    </span>
                  </div>

                  <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: subject.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5">Daily Study Heatmap</h3>

          <div className="grid grid-cols-7 gap-2">
            {heatmapDays.map((day, i) => {
              const minutes = day.minutes ?? 0;

              const bg =
                minutes === 0
                  ? "bg-white/5"
                  : minutes < 60
                    ? "bg-violet-900/50"
                    : minutes < 180
                      ? "bg-violet-700/60"
                      : minutes < 300
                        ? "bg-violet-500/70"
                        : "bg-violet-400";

              return (
                <div
                  key={day.date ?? i}
                  className={`aspect-square rounded-md ${bg}`}
                  title={`${day.date}: ${Math.floor(minutes / 60)}h ${minutes % 60}m`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500">
            Less
            <span className="w-3 h-3 rounded-sm bg-white/5" />
            <span className="w-3 h-3 rounded-sm bg-violet-900/50" />
            <span className="w-3 h-3 rounded-sm bg-violet-700/60" />
            <span className="w-3 h-3 rounded-sm bg-violet-500/70" />
            <span className="w-3 h-3 rounded-sm bg-violet-400" />
            More
          </div>
        </div>

        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5">
            Insights & Recommendations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Clock,
                title: "Best Study Day",
                value: bestStudyDay,
                note: "Based on this week",
                color: "text-violet-400 bg-violet-500/10",
              },
              {
                icon: Target,
                title: "Goal Progress",
                value: `${goalProgress}%`,
                note: `${Math.floor(weekTotalMinutes / 60)}h ${weekTotalMinutes % 60}m this week`,
                color: "text-blue-400 bg-blue-500/10",
              },
              {
                icon: Flame,
                title: "Current Streak",
                value: `${streakCount} days`,
                note:
                  streakCount > 0
                    ? "Keep it up! 🔥"
                    : "Complete one session today",
                color: "text-orange-400 bg-orange-500/10",
              },
              {
                icon: Star,
                title: "Daily Goal",
                value: `${Math.floor(dailyStudyGoalMinutes / 60)}h ${dailyStudyGoalMinutes % 60}m`,
                note: `${dailyTaskGoal} tasks per day`,
                color: "text-green-400 bg-green-500/10",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white/5 border border-white/8 rounded-xl p-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-500">{item.title}</div>
                  <div className="text-lg font-bold text-white">
                    {item.value}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{item.note}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
