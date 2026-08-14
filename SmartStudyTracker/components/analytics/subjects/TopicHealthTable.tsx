"use client";

import { Clock3 } from "lucide-react";
import type { SubjectAnalyticsTopic } from "@/types";

interface Props {
  topics: SubjectAnalyticsTopic[];
}

const healthStyle = {
  EXCELLENT: "bg-emerald-500/10 text-emerald-400",
  GOOD: "bg-cyan-500/10 text-cyan-400",
  NEEDS_REVISION: "bg-orange-500/10 text-orange-400",
  WEAK: "bg-red-500/10 text-red-400",
  IN_PROGRESS: "bg-violet-500/10 text-violet-400",
};

export default function TopicHealthTable({ topics }: Props) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8">
        <h3 className="text-white font-semibold">Topic Health</h3>
        <p className="text-xs text-slate-500 mt-1">
          See every topic&apos;s health, confidence, and next action.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead className="bg-white/[0.02]">
            <tr className="text-left text-xs text-slate-500">
              <th className="px-5 py-3 font-medium">Topic</th>
              <th className="px-5 py-3 font-medium">Health</th>
              <th className="px-5 py-3 font-medium">Readiness</th>
              <th className="px-5 py-3 font-medium">Confidence</th>
              <th className="px-5 py-3 font-medium">Difficulty</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Next Action</th>
              <th className="px-5 py-3 font-medium">Est. Time</th>
            </tr>
          </thead>

          <tbody>
            {topics.map((topic) => (
              <tr
                key={topic.id}
                className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-white">{topic.name}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {topic.status.replace("_", " ")}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      healthStyle[topic.health]
                    }`}
                  >
                    {topic.health.replace("_", " ")}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${(topic.readiness / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">
                      {topic.readiness}/5
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-slate-300">
                  {topic.confidence > 0 ? `${topic.confidence}/5` : "Not rated"}
                </td>

                <td className="px-5 py-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-300">
                    {topic.difficulty}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-300">
                    {topic.priority}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-violet-400">
                  {topic.nextAction}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Clock3 className="w-4 h-4 text-slate-500" />
                    {topic.estimatedHours}h
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}