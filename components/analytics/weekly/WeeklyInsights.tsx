import { Brain, CheckCircle2, AlertTriangle } from "lucide-react";

export default function WeeklyInsights({
  insight,
  stats,
  weakSubject,
}: {
  insight: string;
  stats: {
    totalMinutes: number;
    weeklyGoalPercent: number;
    consistency: number;
    activeStudyDays: number;
  };
  weakSubject: {
    name: string;
    minutes: number;
  } | null;
}) {
  const isGoodWeek = stats.weeklyGoalPercent >= 70 && stats.consistency >= 60;

  return (
    <div className="bg-gradient-to-br from-violet-600/15 to-cyan-500/10 border border-violet-500/20 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-300 flex-shrink-0">
          <Brain className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white">Weekly Coach</h3>

            {isGoodWeek ? (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Good week
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-orange-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                Needs focus
              </span>
            )}
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            {insight}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/8 p-3">
              <div className="text-xs text-slate-500">Goal Progress</div>
              <div className="text-lg font-bold text-white">
                {stats.weeklyGoalPercent}%
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/8 p-3">
              <div className="text-xs text-slate-500">Consistency</div>
              <div className="text-lg font-bold text-white">
                {stats.activeStudyDays}/7 days
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/8 p-3">
              <div className="text-xs text-slate-500">Focus Next</div>
              <div className="text-lg font-bold text-white truncate">
                {weakSubject?.name ?? "Any subject"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}