"use client";

import {
  Sparkles,
  BrainCircuit,
  Lightbulb,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  insight: string;
}

export default function AIInsightCard({
  insight,
}: Props) {
  return (
    <Card className="relative overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-slate-900 to-slate-950">

      {/* Glow Effect */}

      <div className="absolute -top-24 -right-20 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />

      <CardHeader className="relative z-10">

        <CardTitle className="flex items-center gap-3 text-white">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/20">

            <BrainCircuit className="h-6 w-6 text-violet-300" />

          </div>

          <div>

            <p className="flex items-center gap-2 text-lg font-semibold">
              AI Study Insight
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </p>

            <p className="text-sm font-normal text-slate-400">
              Personalized recommendation based on today's activity
            </p>

          </div>

        </CardTitle>

      </CardHeader>

      <CardContent className="relative z-10">

        <div className="rounded-2xl border border-violet-500/20 bg-white/5 p-5">

          <div className="flex gap-4">

            <div className="mt-1">

              <Lightbulb className="h-5 w-5 text-yellow-400" />

            </div>

            <p className="leading-7 text-slate-200">
              {insight}
            </p>

          </div>

        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">

          <Sparkles className="h-4 w-4 text-violet-400" />

          Generated using today's study sessions, completed tasks and syllabus progress.

        </div>

      </CardContent>

    </Card>
  );
}