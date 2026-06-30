"use client";

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
  subject?: {
    id: string;
    name: string;
    color: string;
  };
}

export default function TopicTable({
  topics,
  onSelectTopic,
}: {
  topics: Topic[];
  onSelectTopic: (topic: Topic) => void;
}) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8">
        <h3 className="text-white font-semibold">Topics</h3>
        <p className="text-xs text-slate-500 mt-1">
          Click any topic to update progress, notes, links, and doubts.
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <div className="text-4xl mb-3">📚</div>
          <div className="text-sm">No topics found.</div>
          <p className="text-xs mt-1">
            Add topics or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-xs text-slate-500">
                <th className="px-5 py-3 font-medium">Topic</th>
                <th className="px-5 py-3 font-medium">Difficulty</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Readiness</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Next Action</th>
                <th className="px-5 py-3 font-medium">Est. Time</th>
                <th className="px-5 py-3 font-medium text-right">Open</th>
              </tr>
            </thead>

            <tbody>
              {topics.map((topic) => (
                <TopicRow
                  key={topic.id}
                  topic={topic}
                  onClick={() => onSelectTopic(topic)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}