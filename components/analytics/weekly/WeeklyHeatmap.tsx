"use client";

interface HeatmapDay {
  date: string;
  minutes: number;
}

export default function WeeklyHeatmap({
  heatmapDays,
}: {
  heatmapDays: HeatmapDay[];
}) {
  function getColor(minutes: number) {
    if (minutes === 0) return "bg-white/5";
    if (minutes < 30) return "bg-violet-900";
    if (minutes < 60) return "bg-violet-700";
    if (minutes < 120) return "bg-violet-500";
    return "bg-violet-400";
  }

  function formatMinutes(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h === 0) return `${m} mins`;
    return `${h}h ${m}m`;
  }

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-white">
            Study Consistency
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Last 12 weeks of study activity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Less</span>

          <div className="w-3 h-3 rounded bg-white/5" />
          <div className="w-3 h-3 rounded bg-violet-900" />
          <div className="w-3 h-3 rounded bg-violet-700" />
          <div className="w-3 h-3 rounded bg-violet-500" />
          <div className="w-3 h-3 rounded bg-violet-400" />

          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-1">
        {heatmapDays.map((day) => (
          <div
            key={day.date}
            title={`${day.date}
${formatMinutes(day.minutes)}`}
            className={`
              aspect-square
              rounded-sm
              transition-all
              hover:scale-125
              hover:ring-2
              hover:ring-violet-400
              cursor-pointer
              ${getColor(day.minutes)}
            `}
          />
        ))}
      </div>

      <div className="mt-5 text-xs text-slate-500">
        Every square represents one day.
      </div>
    </div>
  );
}