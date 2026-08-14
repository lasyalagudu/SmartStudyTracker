function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function WeeklyGoalProgress({
  totalMinutes,
  weeklyGoalMinutes,
  weeklyGoalPercent,
}: {
  totalMinutes: number;
  weeklyGoalMinutes: number;
  weeklyGoalPercent: number;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(weeklyGoalPercent, 100);
  const offset = circumference - (progress / 100) * circumference;

  const remainingMinutes = Math.max(weeklyGoalMinutes - totalMinutes, 0);

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-white">Weekly Goal Progress</h3>
        <p className="text-xs text-slate-500 mt-1">
          Track how close you are to your weekly target.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36 mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="14"
            />

            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#7C3AED"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {progress}%
            </span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
            <div className="text-sm font-semibold text-white">
              {formatMinutes(totalMinutes)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Studied</div>
          </div>

          <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
            <div className="text-sm font-semibold text-white">
              {formatMinutes(remainingMinutes)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}