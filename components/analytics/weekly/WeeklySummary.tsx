import { CalendarDays, Clock3, Flame, Target } from "lucide-react";

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function WeeklySummary({
  stats,
}: {
  stats: {
    bestStudyDay: string;
    averageDailyMinutes: number;
    activeStudyDays: number;
    consistency: number;
  };
}) {
  const items = [
    {
      label: "Best Day",
      value: stats.bestStudyDay,
      icon: CalendarDays,
    },
    {
      label: "Avg Daily Study",
      value: formatMinutes(stats.averageDailyMinutes),
      icon: Clock3,
    },
    {
      label: "Study Days",
      value: `${stats.activeStudyDays}/7`,
      icon: Flame,
    },
    {
      label: "Consistency",
      value: `${stats.consistency}%`,
      icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5"
          >
            <div className="inline-flex p-2.5 rounded-xl bg-white/5 text-violet-400 mb-3">
              <Icon className="w-4 h-4" />
            </div>

            <div className="text-xl font-bold text-white">{item.value}</div>
            <div className="text-xs text-slate-500 mt-1">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}