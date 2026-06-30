"use client";

import {
  Clock3,
  Timer,
  CheckSquare,
  GraduationCap,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface Props {
  summary: {
    studyMinutes: number;
    focusSessions: number;
    completedTasks: number;
    totalTasks: number;
    completedTopics: number;
  };

  goals: {
    studyGoalMinutes: number;
  };
}

export default function SummaryCards({
  summary,
  goals,
}: Props) {
  const cards = [
    {
      title: "Study Time",
      value: `${summary.studyMinutes} min`,
      subtitle: `Goal ${goals.studyGoalMinutes} min`,
      icon: Clock3,
    },
    {
      title: "Focus Sessions",
      value: summary.focusSessions,
      subtitle: "Completed today",
      icon: Timer,
    },
    {
      title: "Tasks Completed",
      value: `${summary.completedTasks}/${summary.totalTasks}`,
      subtitle: "Today's tasks",
      icon: CheckSquare,
    },
    {
      title: "Topics Completed",
      value: summary.completedTopics,
      subtitle: "Completed today",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="bg-[#0F172A] border-white/10"
        >
          <CardContent className="p-6">
            <div className="flex justify-between">

              <div>

                <p className="text-slate-400 text-sm">
                  {card.title}
                </p>

                <h2 className="text-3xl font-bold text-white mt-2">
                  {card.value}
                </h2>

                <p className="text-xs text-slate-500 mt-2">
                  {card.subtitle}
                </p>

              </div>

              <card.icon className="w-8 h-8 text-violet-400" />

            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}