import { Flame, Clock, Target, BookOpen } from "lucide-react";

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function WeeklyStatsCards({
  stats,
}: {
  stats: {
    totalMinutes: number;
    totalSessions: number;
    weeklyGoalPercent: number;
    streakCount: number;
    overallProgress: number;
    completedTopics: number;
    totalTopics: number;
  };
}) {
  const cards = [
    {
      label: "Current Streak",
      value: `${stats.streakCount} days`,
      sub: "Keep your routine alive",
      icon: Flame,
      color: "from-orange-500 to-red-600",
    },
    {
      label: "Study Time",
      value: formatMinutes(stats.totalMinutes),
      sub: `${stats.totalSessions} focus sessions`,
      icon: Clock,
      color: "from-violet-500 to-violet-700",
    },
    {
      label: "Weekly Goal",
      value: `${stats.weeklyGoalPercent}%`,
      sub:
        stats.weeklyGoalPercent >= 100
          ? "Goal completed"
          : "Keep going this week",
      icon: Target,
      color: "from-blue-500 to-blue-700",
    },
    {
      label: "Syllabus Progress",
      value: `${stats.overallProgress}%`,
      sub: `${stats.completedTopics}/${stats.totalTopics} topics`,
      icon: BookOpen,
      color: "from-green-500 to-emerald-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 hover:border-violet-500/20 transition-all"
          >
            <div
              className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.color} mb-4`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>

            <div className="text-2xl font-bold text-white">
              {card.value}
            </div>

            <div className="text-sm text-slate-400 mt-1">
              {card.label}
            </div>

            <div className="text-xs text-slate-500 mt-2">
              {card.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}