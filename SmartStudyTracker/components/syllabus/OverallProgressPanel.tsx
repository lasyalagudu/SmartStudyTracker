import { Lightbulb } from "lucide-react";

interface Props {
  subjects: any[];
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
}

export default function OverallProgressPanel({
  subjects,
  totalTopics,
  completedTopics,
  inProgressTopics,
}: Props) {
  const overall =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const notStarted = totalTopics - completedTopics - inProgressTopics;

  return (
    <div className="space-y-4">
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          Overall Progress
        </h3>

        <div className="relative w-28 h-28 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="12"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="url(#overall-gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${overall * 2.39} 239`}
            />
            <defs>
              <linearGradient
                id="overall-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#0891B2" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{overall}%</span>
          </div>
        </div>

        <p className="text-xs text-center text-slate-500 mb-1">
          All subjects progress
        </p>
        <p className="text-xs text-center text-violet-400 font-medium">
          {completedTopics} / {totalTopics} topics completed
        </p>
      </div>

      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Stats</h3>

        {[
          { label: "Total Subjects", value: subjects.length, color: "#7C3AED" },
          { label: "Total Topics", value: totalTopics, color: "#2563EB" },
          {
            label: "Completed Topics",
            value: completedTopics,
            color: "#059669",
          },
          {
            label: "In Progress",
            value: inProgressTopics,
            color: "#D97706",
          },
          { label: "Not Started", value: notStarted, color: "#475569" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
          >
            <span className="text-xs text-slate-400 flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: stat.color }}
              />
              {stat.label}
            </span>

            <span className="text-sm font-semibold text-white">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-300 mb-1">Tip</p>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Focus on completing topics one by one. Consistency today, mastery
              tomorrow!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}