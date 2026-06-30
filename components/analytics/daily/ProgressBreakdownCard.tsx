"use client";

import {
  BookOpen,
  Brain,
  FileQuestion,
  RotateCw,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

interface Props {
  progress: {
    theory: number;
    problems: number;
    pyqs: number;
    revision: number;
  };
}

export default function ProgressBreakdownCard({
  progress,
}: Props) {
  const items = [
    {
      title: "Theory",
      value: progress.theory,
      icon: BookOpen,
      color: "text-blue-400",
    },
    {
      title: "Problems",
      value: progress.problems,
      icon: Brain,
      color: "text-emerald-400",
    },
    {
      title: "PYQs",
      value: progress.pyqs,
      icon: FileQuestion,
      color: "text-amber-400",
    },
    {
      title: "Revision",
      value: progress.revision,
      icon: RotateCw,
      color: "text-violet-400",
    },
  ];

  return (
    <Card className="bg-[#0F172A] border-white/10">
      <CardHeader>
        <CardTitle className="text-white">
          Today's Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <Icon
                    className={`w-5 h-5 ${item.color}`}
                  />

                  <span className="text-slate-200 font-medium">
                    {item.title}
                  </span>

                </div>

                <span className="text-sm font-semibold text-white">
                  {item.value}%
                </span>

              </div>

              <Progress
                value={item.value}
                className="h-2"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}