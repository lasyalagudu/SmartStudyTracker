"use client";

import { Clock3, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  name: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  theoryDone: boolean;
  problemsDone: boolean;
  pyqsDone: boolean;
  revisionDone: boolean;
  mastered: boolean;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedHours: number;
  confidence: number;
  completedAt?: string | null;
  lastRevisedAt?: string | null;
  subject?: {
    id: string;
    name: string;
    color: string;
  };
}

function getReadiness(topic: Topic) {
  return [
    topic.theoryDone,
    topic.problemsDone,
    topic.pyqsDone,
    topic.revisionDone,
    topic.mastered,
  ].filter(Boolean).length;
}

function getNextAction(topic: Topic) {
  if (!topic.theoryDone) return "Read Theory";
  if (!topic.problemsDone) return "Solve Problems";
  if (!topic.pyqsDone) return "Attempt PYQs";
  if (!topic.revisionDone) return "Revise";
  if (!topic.mastered) return "Mark Mastered";
  return "Completed";
}

function getStatusStyle(status: Topic["status"]) {
  if (status === "COMPLETED") {
    return "bg-green-500/10 text-green-400";
  }

  if (status === "IN_PROGRESS") {
    return "bg-orange-500/10 text-orange-400";
  }

  return "bg-slate-500/10 text-slate-400";
}

function getPriorityStyle(priority: Topic["priority"]) {
  if (priority === "HIGH") return "bg-red-500/10 text-red-400";
  if (priority === "MEDIUM") return "bg-yellow-500/10 text-yellow-400";
  return "bg-slate-500/10 text-slate-400";
}

function getDifficultyStyle(difficulty: Topic["difficulty"]) {
  if (difficulty === "HARD") return "bg-red-500/10 text-red-400";
  if (difficulty === "MEDIUM") return "bg-violet-500/10 text-violet-400";
  return "bg-green-500/10 text-green-400";
}

export default function TopicRow({
  topic,
  onClick,
}: {
  topic: Topic;
  onClick: () => void;
}) {
  const readiness = getReadiness(topic);
  const readinessPercent = Math.round((readiness / 5) * 100);
  const nextAction = getNextAction(topic);

  return (
    <tr
      onClick={onClick}
      className="group cursor-pointer border-b border-white/5 hover:bg-white/[0.03] transition-colors"
    >
      <td className="px-5 py-4">
        <div>
          <div className="font-medium text-white group-hover:text-violet-300 transition-colors">
            {topic.name}
          </div>

          {topic.subject && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: topic.subject.color }}
              />
              {topic.subject.name}
            </div>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            getDifficultyStyle(topic.difficulty)
          )}
        >
          {topic.difficulty}
        </span>
      </td>

      <td className="px-5 py-4">
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            getPriorityStyle(topic.priority)
          )}
        >
          {topic.priority}
        </span>
      </td>

      <td className="px-5 py-4 min-w-36">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          <span className="text-xs text-slate-400 w-10">
            {readiness}/5
          </span>
        </div>
      </td>

      <td className="px-5 py-4">
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            getStatusStyle(topic.status)
          )}
        >
          {topic.status.replace("_", " ")}
        </span>
      </td>

      <td className="px-5 py-4">
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            nextAction === "Completed"
              ? "bg-green-500/10 text-green-400"
              : "bg-violet-500/10 text-violet-300"
          )}
        >
          {nextAction}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <Clock3 className="w-4 h-4 text-slate-500" />
          {topic.estimatedHours}h
        </div>
      </td>

      <td className="px-5 py-4 text-right">
        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-violet-400 ml-auto" />
      </td>
    </tr>
  );
}