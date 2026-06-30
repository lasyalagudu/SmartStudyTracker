"use client";

import { BookOpen, CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

interface Props {
  stats: {
    studyMinutes: number;
    studyGoalMinutes: number;
    completedTasks: number;
    taskGoal: number;
  };
}

export default function DailyGoalsCard({ stats }: Props) {
  const studyPercent =
    stats.studyGoalMinutes > 0
      ? Math.min(
          100,
          Math.round((stats.studyMinutes / stats.studyGoalMinutes) * 100)
        )
      : 0;

  const taskPercent =
    stats.taskGoal > 0
      ? Math.min(
          100,
          Math.round((stats.completedTasks / stats.taskGoal) * 100)
        )
      : 0;

  return (
    <Card className="bg-[#0F172A] border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg">
          Today's Goals
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">

        {/* Study Goal */}

        <div className="space-y-3">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-400" />

              <span className="text-sm font-medium text-slate-200">
                Study Goal
              </span>
            </div>

            <span className="text-sm font-semibold text-white">
              {stats.studyMinutes}/{stats.studyGoalMinutes} min
            </span>

          </div>

          <Progress
            value={studyPercent}
            className="h-3"
          />

          <div className="flex justify-between text-xs text-slate-400">
            <span>{studyPercent}% completed</span>

            <span>
              {Math.max(
                0,
                stats.studyGoalMinutes - stats.studyMinutes
              )}{" "}
              min left
            </span>
          </div>

        </div>

        {/* Task Goal */}

        <div className="space-y-3">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />

              <span className="text-sm font-medium text-slate-200">
                Task Goal
              </span>
            </div>

            <span className="text-sm font-semibold text-white">
              {stats.completedTasks}/{stats.taskGoal}
            </span>

          </div>

          <Progress
            value={taskPercent}
            className="h-3"
          />

          <div className="flex justify-between text-xs text-slate-400">
            <span>{taskPercent}% completed</span>

            <span>
              {Math.max(
                0,
                stats.taskGoal - stats.completedTasks
              )}{" "}
              tasks left
            </span>
          </div>

        </div>

      </CardContent>
    </Card>
  );
}