"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TrendingUp } from "lucide-react";

interface Props {
  score: number;
}

export default function ProductivityCard({ score }: Props) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference - (Math.min(score, 100) / 100) * circumference;

  let message = "Keep going!";

  if (score >= 90) {
    message = "Outstanding productivity today!";
  } else if (score >= 75) {
    message = "Excellent consistency.";
  } else if (score >= 60) {
    message = "Good progress. Push a little more!";
  } else if (score >= 40) {
    message = "You're getting started. Stay focused.";
  } else {
    message = "Complete a few more study sessions today.";
  }

  return (
    <Card className="bg-[#0F172A] border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="w-5 h-5 text-violet-400" />
          Productivity Score
        </CardTitle>
      </CardHeader>

      <CardContent>

        <div className="flex flex-col items-center">

          <div className="relative w-40 h-40">

            <svg
              className="w-40 h-40 -rotate-90"
              viewBox="0 0 120 120"
            >

              {/* Background */}

              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#1E293B"
                strokeWidth="10"
              />

              {/* Progress */}

              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  transition: "stroke-dashoffset 0.8s ease",
                }}
              />

            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <p className="text-4xl font-bold text-white">
                {score}
              </p>

              <span className="text-sm text-slate-400">
                /100
              </span>

            </div>

          </div>

          <p className="mt-6 text-center text-sm text-slate-300">
            {message}
          </p>

        </div>

      </CardContent>
    </Card>
  );
}