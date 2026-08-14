"use client";

import { Target } from "lucide-react";

interface Props {
  totalMinutes: number;
  monthlyGoalMinutes: number;
  monthlyGoalPercent: number;
}

function formatMinutes(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs}h ${mins}m`;
}

export default function MonthlyGoalCard({
  totalMinutes,
  monthlyGoalMinutes,
  monthlyGoalPercent,
}: Props) {
  const remaining = Math.max(monthlyGoalMinutes - totalMinutes, 0);

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">Monthly Goal</h3>
          <p className="text-sm text-slate-500 mt-1">
            Your progress toward this month&apos;s study target.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
          <Target className="w-5 h-5" />
        </div>
      </div>

      <div className="text-3xl font-bold text-white">
        {monthlyGoalPercent}%
      </div>

      <div className="mt-2 text-sm text-slate-400">
        {formatMinutes(totalMinutes)} / {formatMinutes(monthlyGoalMinutes)}
      </div>

      <div className="mt-5 h-3 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all"
          style={{ width: `${Math.min(monthlyGoalPercent, 100)}%` }}
        />
      </div>

      <div className="mt-4 text-sm text-slate-500">
        {remaining === 0
          ? "Goal completed. Great work!"
          : `${formatMinutes(remaining)} remaining this month.`}
      </div>
    </div>
  );
}