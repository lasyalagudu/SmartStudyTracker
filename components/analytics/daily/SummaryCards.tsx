"use client";

import {
  Clock3,
  Timer,
  CheckCircle2,
  BookOpenCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface Props {
  stats: {
    studyMinutes: number;
    focusSessions: number;
    completedTasks: number;
    taskGoal: number;
    completedTopics: number;
    studyGoalMinutes: number;
  };
}

export default function SummaryCards({ stats }: Props) {
  const cards = [
    {
      title: "Study Time",
      value: `${stats.studyMinutes} min`,
      subtitle: `Goal ${stats.studyGoalMinutes} min`,
      icon: Clock3,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Focus Sessions",
      value: stats.focusSessions,
      subtitle: "Completed today",
      icon: Timer,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Tasks Completed",
      value: `${stats.completedTasks}/${stats.taskGoal}`,
      subtitle: "Today's tasks",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Topics Completed",
      value: stats.completedTopics,
      subtitle: "Mastered today",
      icon: BookOpenCheck,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="bg-[#0F172A] border-white/10 hover:border-violet-500/40 transition-all duration-300"
          >
            <CardContent className="p-6">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-white">
                    {card.value}
                  </h2>

                  <p className="mt-2 text-xs text-slate-500">
                    {card.subtitle}
                  </p>

                </div>

                <div
                  className={`rounded-xl p-3 ${card.bg}`}
                >
                  <Icon
                    className={`w-6 h-6 ${card.color}`}
                  />
                </div>

              </div>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}