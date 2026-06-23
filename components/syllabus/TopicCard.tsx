"use client";

import { useState } from "react";
import { ChevronRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
}

interface Props {
  topic: Topic;
  onUpdate: (topicId: string, field: keyof Topic, value: boolean | string) => void;
  onRename?: (topic: Topic) => void;
  onDelete?: (topic: Topic) => void;
}

const CHECKBOXES: { field: keyof Topic; label: string; color: string }[] = [
  { field: "theoryDone", label: "Theory Done", color: "#3b82f6" },
  { field: "problemsDone", label: "Problems Solved", color: "#8b5cf6" },
  { field: "pyqsDone", label: "PYQs Done", color: "#06b6d4" },
  { field: "revisionDone", label: "Revision Done", color: "#f59e0b" },
  { field: "mastered", label: "Mastered", color: "#10b981" },
];

function getTopicCompletion(topic: Topic) {
  const done = [
    topic.theoryDone,
    topic.problemsDone,
    topic.pyqsDone,
    topic.revisionDone,
    topic.mastered,
  ].filter(Boolean).length;

  return Math.round((done / 5) * 100);
}

export default function TopicCard({ topic, onUpdate, onRename, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const pct = getTopicCompletion(topic);

  const statusColor =
    topic.status === "COMPLETED"
      ? "#10b981"
      : topic.status === "IN_PROGRESS"
      ? "#7C3AED"
      : "#475569";

  return (
    <div
      className={cn(
        "relative bg-[#0A0F1E] border rounded-xl transition-all duration-200",
        topic.status === "COMPLETED"
          ? "border-green-500/20"
          : "border-white/8 hover:border-violet-500/20"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
        >
          <ChevronRight
            className={cn("w-4 h-4 transition-transform", expanded && "rotate-90")}
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium",
                topic.status === "COMPLETED" ? "text-slate-400" : "text-white"
              )}
            >
              {topic.name}
            </span>

            <span
              className="text-xs px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: `${statusColor}20`, color: statusColor }}
            >
              {pct}%
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          {CHECKBOXES.map(({ field, label, color }) => (
            <div key={field} className="flex flex-col items-center gap-1 w-20">
              <button
                onClick={() => onUpdate(topic.id, field, !topic[field])}
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                  topic[field]
                    ? "border-transparent"
                    : "border-slate-600 hover:border-slate-400 bg-transparent"
                )}
                style={topic[field] ? { background: color, borderColor: color } : {}}
                title={label}
              >
                {topic[field] && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="text-slate-600 hover:text-slate-400 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {open && (
            <div className="absolute right-0 top-7 z-[9999] w-36 rounded-xl border border-white/10 bg-[#0A0F1E] shadow-2xl py-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onRename?.(topic);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                <Pencil className="w-4 h-4" />
                Rename
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onDelete?.(topic);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 sm:hidden">
          <div className="flex flex-wrap gap-3">
            {CHECKBOXES.map(({ field, label, color }) => (
              <button
                key={field}
                onClick={() => onUpdate(topic.id, field, !topic[field])}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all",
                  topic[field] ? "text-white" : "border-white/10 text-slate-500"
                )}
                style={
                  topic[field]
                    ? {
                        background: `${color}20`,
                        borderColor: `${color}40`,
                        color,
                      }
                    : {}
                }
              >
                {topic[field] ? "✓" : "○"} {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}