"use client";

import {
  BookOpen,
  Clock3,
  CheckCircle2,
  Brain,
} from "lucide-react";

interface Props {
  totalTopics: number;
  completedTopics: number;
  totalStudyMinutes: number;
  averageConfidence: number;
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
}

export default function SubjectSummaryCards({
  totalTopics,
  completedTopics,
  totalStudyMinutes,
  averageConfidence,
}: Props) {
  const progress =
    totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;

  const cards = [
    {
      title: "Progress",
      value: `${progress}%`,
      subtitle: `${completedTopics}/${totalTopics} Topics`,
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      title: "Study Time",
      value: formatMinutes(totalStudyMinutes),
      subtitle: "Total Focus Time",
      icon: Clock3,
      color: "text-violet-400",
    },
    {
      title: "Topics",
      value: totalTopics,
      subtitle: "Total in Subject",
      icon: BookOpen,
      color: "text-cyan-400",
    },
    {
      title: "Confidence",
      value: `${averageConfidence}/5`,
      subtitle: "Average Rating",
      icon: Brain,
      color: "text-orange-400",
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
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">
                  {card.title}
                </p>

                <h2 className="text-3xl font-bold text-white mt-2">
                  {card.value}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {card.subtitle}
                </p>
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