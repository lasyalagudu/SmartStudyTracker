"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Plus } from "lucide-react";
import TopicRow from "./TopicRow";

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
}

interface Subject {
  id: string;
  name: string;
  color: string;
  topics: Topic[];
}

interface Props {
  subjects: Subject[];
  onSelectTopic: (topic: any) => void;
  onAddTopic: (subject: Subject) => void;
}

export default function TopicTable({
  subjects,
  onSelectTopic,
  onAddTopic,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};

    subjects.forEach((s) => {
      obj[s.id] = true;
    });

    return obj;
  });

  function toggle(id: string) {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  if (subjects.length === 0) {
    return (
      <div className="bg-[#0A0F1E] rounded-2xl border border-white/10 py-16 text-center">
        <div className="text-4xl mb-4">📚</div>
        <p className="text-slate-400">No topics found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {subjects.map((subject) => {
        const completed = subject.topics.filter(
          (t) => t.status === "COMPLETED"
        ).length;

        const inProgress = subject.topics.filter(
          (t) => t.status === "IN_PROGRESS"
        ).length;

        return (
          <div
            key={subject.id}
            className="bg-[#0A0F1E] rounded-2xl border border-white/10 overflow-hidden"
          >
            <div
              onClick={() => toggle(subject.id)}
              className="cursor-pointer px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                {expanded[subject.id] ? (
                  <ChevronDown className="w-5 h-5 text-violet-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-violet-400" />
                )}

                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: subject.color }}
                />

                <div>
                  <h3 className="text-white font-semibold">
                    {subject.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {subject.topics.length} topics • {inProgress} in progress •{" "}
                    {completed} completed
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTopic(subject);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5"
              >
                <Plus className="w-4 h-4" />
                Topic
              </button>
            </div>

            {expanded[subject.id] && (
              <div className="overflow-x-auto border-t border-white/10">
                {subject.topics.length === 0 ? (
                  <div className="py-10 text-center text-slate-500">
                    No topics yet.
                  </div>
                ) : (
                  <table className="w-full min-w-[980px]">
                    <thead className="bg-white/[0.02]">
                      <tr className="text-left text-xs text-slate-500">
                        <th className="px-5 py-3">Topic</th>
                        <th className="px-5 py-3">Difficulty</th>
                        <th className="px-5 py-3">Priority</th>
                        <th className="px-5 py-3">Readiness</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Next Action</th>
                        <th className="px-5 py-3">Est. Time</th>
                        <th className="px-5 py-3 text-right">Open</th>
                      </tr>
                    </thead>

                    <tbody>
                      {subject.topics.map((topic) => (
                        <TopicRow
                          key={topic.id}
                          topic={{
                            ...topic,
                            subject: {
                              id: subject.id,
                              name: subject.name,
                              color: subject.color,
                            },
                          }}
                          onClick={() =>
                            onSelectTopic({
                              ...topic,
                              subject: {
                                id: subject.id,
                                name: subject.name,
                                color: subject.color,
                              },
                            })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}