"use client";

import { AlertTriangle, ChevronRight } from "lucide-react";
import type { SubjectAnalyticsTopic } from "@/types";

interface Props {
  topics: SubjectAnalyticsTopic[];
}

const healthColor = {
  EXCELLENT: "bg-emerald-500/20 text-emerald-400",
  GOOD: "bg-cyan-500/20 text-cyan-400",
  NEEDS_REVISION: "bg-orange-500/20 text-orange-400",
  WEAK: "bg-red-500/20 text-red-400",
  IN_PROGRESS: "bg-violet-500/20 text-violet-400",
};

export default function WeakTopicsCard({ topics }: Props) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>

        <div>
          <h3 className="text-white font-semibold">
            Weak Topics
          </h3>

          <p className="text-sm text-slate-500">
            Focus on these first.
          </p>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          🎉 No weak topics found.
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3"
            >
              <div>
                <h4 className="text-white font-medium">
                  {topic.name}
                </h4>

                <div className="flex gap-2 mt-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      healthColor[topic.health]
                    }`}
                  >
                    {topic.health.replace("_", " ")}
                  </span>

                  <span className="text-xs text-slate-500">
                    Confidence {topic.confidence}/5
                  </span>

                  <span className="text-xs text-slate-500">
                    {topic.estimatedHours} hrs
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-violet-400">
                {topic.nextAction}
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}