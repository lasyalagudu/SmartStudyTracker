import { Flame, Clock, Calendar, Target, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  streak: number;
  daysLeft: number | null;
  targetDate: string | null;
  overallProgress: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
  onLogStudy?: () => void;
}

export default function StatsCards({
  streak,
  daysLeft,
  targetDate,
  overallProgress,
  todayMinutes,
  dailyGoalMinutes,
  onLogStudy,
}: Props) {
  const studiedToday = todayMinutes > 0;

  const studyHours = Math.floor(todayMinutes / 60);
  const studyMins = todayMinutes % 60;
  const studyTimeLabel = `${studyHours}h ${studyMins}m`;

  const goalHours = Math.floor(dailyGoalMinutes / 60);
  const goalMins = dailyGoalMinutes % 60;

  const goalProgress =
    dailyGoalMinutes > 0
      ? Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100))
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Streak Card */}
      <div
        className={cn(
          "bg-[#0A0F1E] border rounded-2xl p-5 transition-all duration-300",
          studiedToday
            ? "border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.12)]"
            : "border-yellow-500/25"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Flame className="w-5 h-5 text-white" />
          </div>

          {studiedToday ? (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Safe today
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Study today
            </span>
          )}
        </div>

        <div className="text-3xl font-bold text-white">{streak}</div>
        <div className="text-sm text-slate-400 mb-3">Day Streak</div>

        <div className="progress-bar mb-2">
          <div className="progress-fill" style={{ width: `${goalProgress}%` }} />
        </div>

        <div className="text-xs text-slate-500 mb-3">
          Today: {studyTimeLabel} / {goalHours}h {goalMins}m
        </div>

        <div className="rounded-xl bg-white/5 border border-white/8 p-3 mb-3">
          <p className="text-xs text-slate-300 mb-2">
            Your streak grows when you:
          </p>
          <ul className="space-y-1 text-[11px] text-slate-500">
            <li>✓ Complete a focus session</li>
            <li>✓ Finish a planner task</li>
            <li>✓ Log offline study</li>
          </ul>
        </div>

        {onLogStudy && (
          <button
            onClick={onLogStudy}
            className="w-full py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium hover:bg-orange-500/15 transition-colors"
          >
            + Log Offline Study
          </button>
        )}
      </div>

      {/* Study Time */}
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 hover:border-violet-500/20 transition-all duration-300">
        <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 mb-3">
          <Clock className="w-5 h-5 text-white" />
        </div>

        <div className="text-3xl font-bold text-white mb-0.5">
          {studyTimeLabel}
        </div>
        <div className="text-sm text-slate-400 mb-2">Today's Study Time</div>

        <div className="progress-bar mb-1.5">
          <div className="progress-fill" style={{ width: `${goalProgress}%` }} />
        </div>

        <div className="text-xs text-slate-500">
          Goal: {goalHours}h {goalMins}m
        </div>
      </div>

      {/* Days Left */}
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 hover:border-violet-500/20 transition-all duration-300">
        <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 mb-3">
          <Calendar className="w-5 h-5 text-white" />
        </div>

        <div className="text-3xl font-bold text-white mb-0.5">
          {daysLeft !== null ? daysLeft : "—"}
        </div>
        <div className="text-sm text-slate-400 mb-2">Days Left</div>
        <div className="text-xs text-slate-500">
          {targetDate ? formatDate(targetDate) : "No date set"}
        </div>
      </div>

      {/* Syllabus */}
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 hover:border-violet-500/20 transition-all duration-300">
        <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 mb-3">
          <Target className="w-5 h-5 text-white" />
        </div>

        <div className="text-3xl font-bold text-white mb-0.5">
          {overallProgress}%
        </div>
        <div className="text-sm text-slate-400 mb-2">Syllabus Completed</div>

        <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
          View Progress →
        </button>
      </div>
    </div>
  );
}