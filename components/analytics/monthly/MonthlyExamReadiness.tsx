"use client";

import { Target, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  overallProgress: number;
  completedTopics: number;
  totalTopics: number;
  consistency: number;
  monthlyGoalPercent: number;
}

export default function MonthlyExamReadiness({
  overallProgress,
  completedTopics,
  totalTopics,
  consistency,
  monthlyGoalPercent,
}: Props) {
  const readiness = Math.round(
    overallProgress * 0.6 +
      consistency * 0.2 +
      monthlyGoalPercent * 0.2
  );

  const status =
    readiness >= 75
      ? "On Track"
      : readiness >= 45
      ? "Needs Focus"
      : "At Risk";

  const Icon = readiness >= 75 ? CheckCircle2 : AlertTriangle;

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Exam Readiness</h3>
          <p className="text-sm text-slate-500 mt-1">
            Based on syllabus progress, goal completion, and consistency.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
          <Target className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="48"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="48"
              stroke="#7C3AED"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={
                2 * Math.PI * 48 -
                (readiness / 100) * (2 * Math.PI * 48)
              }
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {readiness}%
              </div>
              <div className="text-xs text-slate-500">ready</div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Icon
              className={
                readiness >= 75
                  ? "w-5 h-5 text-green-400"
                  : "w-5 h-5 text-orange-400"
              }
            />
            <span className="text-white font-semibold">{status}</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Syllabus</span>
              <span className="text-white">
                {completedTopics}/{totalTopics} topics
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Consistency</span>
              <span className="text-white">{consistency}%</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Monthly Goal</span>
              <span className="text-white">{monthlyGoalPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}