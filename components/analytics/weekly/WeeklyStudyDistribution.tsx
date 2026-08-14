"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SubjectStudyTime {
  id: string;
  name: string;
  color: string;
  minutes: number;
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function WeeklyStudyDistribution({
  subjects,
}: {
  subjects: SubjectStudyTime[];
}) {
  const totalMinutes = subjects.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-white">Study Distribution</h3>
        <p className="text-xs text-slate-500 mt-1">
          Which subjects received your time this week.
        </p>
      </div>

      {subjects.length === 0 || totalMinutes === 0 ? (
        <div className="text-center py-12 text-slate-600 text-sm">
          No subject-wise study time yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjects}
                  dataKey="minutes"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {subjects.map((subject) => (
                    <Cell key={subject.id} fill={subject.color} />
                  ))}
                </Pie>

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;

                    const item = payload[0].payload as SubjectStudyTime;
                    const percent =
                      totalMinutes > 0
                        ? Math.round((item.minutes / totalMinutes) * 100)
                        : 0;

                    return (
                      <div className="rounded-xl border border-white/10 bg-[#070B14] px-3 py-2 shadow-xl">
                        <div className="text-sm font-semibold text-white">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatMinutes(item.minutes)} · {percent}%
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
              const percent =
                totalMinutes > 0
                  ? Math.round((subject.minutes / totalMinutes) * 100)
                  : 0;

              return (
                <div
                  key={subject.id}
                  className="flex items-center justify-between gap-3"
                >
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
      )}
    </div>
  );
}