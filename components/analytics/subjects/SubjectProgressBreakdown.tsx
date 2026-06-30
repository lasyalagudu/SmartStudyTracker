"use client";

interface Props {
  totalTopics: number;
  breakdown: {
    theoryDone: number;
    problemsDone: number;
    pyqsDone: number;
    revisionDone: number;
    mastered: number;
  };
}

const rows = [
  { key: "theoryDone", label: "Theory Done" },
  { key: "problemsDone", label: "Problems Done" },
  { key: "pyqsDone", label: "PYQs Done" },
  { key: "revisionDone", label: "Revision Done" },
  { key: "mastered", label: "Mastered" },
] as const;

export default function SubjectProgressBreakdown({
  totalTopics,
  breakdown,
}: Props) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <h3 className="text-white font-semibold">Progress Breakdown</h3>
      <p className="text-sm text-slate-500 mt-1">
        See which part of this subject needs work.
      </p>

      <div className="space-y-4 mt-6">
        {rows.map((row) => {
          const value = breakdown[row.key];
          const percent =
            totalTopics > 0 ? Math.round((value / totalTopics) * 100) : 0;

          return (
            <div key={row.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">{row.label}</span>
                <span className="text-xs text-slate-500">
                  {value}/{totalTopics} · {percent}%
                </span>
              </div>

              <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}