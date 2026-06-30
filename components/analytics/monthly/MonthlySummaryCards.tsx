"use client";

import {
  Clock3,
  BookOpen,
  Timer,
  Target,
} from "lucide-react";

interface Props {
  totalMinutes: number;
  totalSessions: number;
  topicsCompleted: number;
  consistency: number;
}

function formatMinutes(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs}h ${mins}m`;
}

export default function MonthlySummaryCards({
  totalMinutes,
  totalSessions,
  topicsCompleted,
  consistency,
}: Props) {
  const cards = [
    {
      title: "Study Time",
      value: formatMinutes(totalMinutes),
      icon: Clock3,
      color: "text-violet-400",
    },
    {
      title: "Topics Completed",
      value: topicsCompleted,
      icon: BookOpen,
      color: "text-emerald-400",
    },
    {
      title: "Focus Sessions",
      value: totalSessions,
      icon: Timer,
      color: "text-orange-400",
    },
    {
      title: "Consistency",
      value: `${consistency}%`,
      icon: Target,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {card.title}
                </p>

                <h2 className="text-3xl font-bold text-white mt-2">
                  {card.value}
                </h2>
              </div>

              <div
                className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${card.color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}