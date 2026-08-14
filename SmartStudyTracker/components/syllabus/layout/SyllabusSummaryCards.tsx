import {
  BookOpen,
  CheckCircle2,
  Clock3,
  CircleDot,
  Timer,
} from "lucide-react";

interface Props {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  estimatedHours: number;
}

export default function SyllabusSummaryCards({
  totalTopics,
  completedTopics,
  inProgressTopics,
  estimatedHours,
}: Props) {
  const notStarted = totalTopics - completedTopics - inProgressTopics;

  const cards = [
    {
      title: "Total Topics",
      value: totalTopics,
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Completed",
      value: `${completedTopics}/${totalTopics}`,
      subtitle:
        totalTopics > 0
          ? `${Math.round((completedTopics / totalTopics) * 100)}%`
          : "0%",
      icon: CheckCircle2,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "In Progress",
      value: inProgressTopics,
      icon: CircleDot,
      gradient: "from-orange-500 to-amber-500",
    },
    {
      title: "Not Started",
      value: notStarted,
      icon: Clock3,
      gradient: "from-slate-500 to-slate-700",
    },
    {
      title: "Estimated Hours",
      value: `${estimatedHours} hrs`,
      icon: Timer,
      gradient: "from-violet-500 to-fuchsia-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-white/8 bg-[#0A0F1E] p-5 hover:border-violet-500/30 transition-all duration-300"
          >
            <div
              className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.gradient} mb-4`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>

            <div className="text-3xl font-bold text-white">
              {card.value}
            </div>

            {card.subtitle && (
              <div className="text-green-400 text-xs mt-1">
                {card.subtitle}
              </div>
            )}

            <div className="text-sm text-slate-400 mt-2">
              {card.title}
            </div>
          </div>
        );
      })}
    </div>
  );
}