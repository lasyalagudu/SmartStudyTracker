"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SubjectDistribution {
  id: string;
  name: string;
  color: string;
  minutes: number;
  sessions: number;
}

interface Props {
  subjects: SubjectDistribution[];
}

function formatMinutes(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs}h ${mins}m`;
}

export default function MonthlySubjectDistribution({ subjects }: Props) {
  const totalMinutes = subjects.reduce((sum, subject) => sum + subject.minutes, 0);

  if (subjects.length === 0 || totalMinutes === 0) {
    return (
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
        <h3 className="text-white font-semibold">Subject Distribution</h3>
        <p className="text-sm text-slate-500 mt-1">
          Subject-wise study time will appear here.
        </p>

        <div className="text-center py-16 text-slate-600 text-sm">
          No subject data this month.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="mb-5">
        <h3 className="text-white font-semibold">Subject Distribution</h3>
        <p className="text-sm text-slate-500 mt-1">
          Where your study time went this month.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjects}
                dataKey="minutes"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {subjects.map((subject) => (
                  <Cell key={subject.id} fill={subject.color} />
                ))}
              </Pie>

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const item = payload[0].payload as SubjectDistribution;
                  const percent = Math.round((item.minutes / totalMinutes) * 100);

                  return (
                    <div className="rounded-xl border border-white/10 bg-[#070B14] px-3 py-2 shadow-xl">
                      <div className="text-sm font-semibold text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatMinutes(item.minutes)} · {percent}% · {item.sessions} sessions
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {subjects.map((subject) => {
            const percent = Math.round((subject.minutes / totalMinutes) * 100);

            return (
              <div key={subject.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: subject.color }}
                  />

                  <span className="text-sm text-slate-300 truncate">
                    {subject.name}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex-shrink-0">
                  {formatMinutes(subject.minutes)} · {percent}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}