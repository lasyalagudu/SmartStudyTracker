"use client";

import { BookOpen, CheckCircle2 } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

interface Props {
  summary: {
    studyMinutes: number;
    completedTasks: number;
  };

  goals: {
    studyGoalMinutes: number;
    studyGoalPercent: number;
    dailyTaskGoal: number;
    taskGoalPercent: number;
  };
}

export default function DailyGoalsCard({
  summary,
  goals,
}: Props) {
  return (
    <Card className="bg-[#0F172A] border-white/10">
      <CardHeader>
        <CardTitle className="text-white">
          Today's Goals
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">

        <div className="space-y-3">

          <div className="flex justify-between">

            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-400" />
              <span className="text-white">
                Study Goal
              </span>
            </div>

            <span className="text-white">
              {summary.studyMinutes}/{goals.studyGoalMinutes} min
            </span>

          </div>

          <Progress value={goals.studyGoalPercent} />

          <div className="flex justify-between text-xs text-slate-400">

            <span>
              {goals.studyGoalPercent}% completed
            </span>

            <span>
              {Math.max(
                0,
                goals.studyGoalMinutes -
                  summary.studyMinutes
              )}{" "}
              min left
            </span>

          </div>

        </div>

        <div className="space-y-3">

          <div className="flex justify-between">

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-white">
                Task Goal
              </span>
            </div>

            <span className="text-white">
              {summary.completedTasks}/{goals.dailyTaskGoal}
            </span>

          </div>

          <Progress value={goals.taskGoalPercent} />

          <div className="flex justify-between text-xs text-slate-400">

            <span>
              {goals.taskGoalPercent}% completed
            </span>

            <span>
              {Math.max(
                0,
                goals.dailyTaskGoal -
                  summary.completedTasks
              )}{" "}
              tasks left
            </span>

          </div>

        </div>

      </CardContent>
    </Card>
  );
}