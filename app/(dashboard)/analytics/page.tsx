"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Clock, Target, Loader2 } from "lucide-react";
import type { Subject } from "@/types";

export default function AnalyticsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/analytics");
      const data = await res.json();

      if (res.ok) {
        setSubjects(data.subjects ?? []);
        setTotalSessions(data.totalSessions ?? 0);
        setTotalMinutes(data.totalMinutes ?? 0);
      }

      setLoading(false);
    }

    load();
  }, []);

  const totalTopics = subjects.reduce(
    (acc, s) => acc + (s.topics?.length ?? 0),
    0
  );

  const completedTopics = subjects.reduce(
    (acc, s) =>
      acc +
      (s.topics?.filter((t) => t.status === "COMPLETED" || t.mastered)
        .length ?? 0),
    0
  );

  const overallProgress =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track your study patterns and progress.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Overall Progress",
            value: `${overallProgress}%`,
            icon: Target,
            color: "from-violet-500 to-violet-700",
          },
          {
            label: "Topics Completed",
            value: completedTopics,
            icon: TrendingUp,
            color: "from-green-500 to-emerald-700",
          },
          {
            label: "Study Sessions",
            value: totalSessions,
            icon: Clock,
            color: "from-blue-500 to-blue-700",
          },
          {
            label: "Total Study Time",
            value: `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`,
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
                className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 mt-0.5">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-5">
          Subject-wise Progress
        </h3>

        {subjects.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <div>No subjects found. Set up your syllabus to see analytics.</div>
          </div>
        )}

        <div className="space-y-4">
          {subjects.map((subject) => {
            const total = subject.topics?.length ?? 0;
            const done =
              subject.topics?.filter(
                (t) => t.status === "COMPLETED" || t.mastered
              ).length ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={subject.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: subject.color }}
                    />
                    <span className="text-sm font-medium text-white">
                      {subject.name}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">
                    {done} / {total} topics · {pct}%
                  </div>
                </div>

                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: subject.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}