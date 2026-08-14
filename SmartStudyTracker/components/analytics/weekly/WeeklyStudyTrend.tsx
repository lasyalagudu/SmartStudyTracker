"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function WeeklyStudyTrend({
  weeklyMinutes,
  dailyGoalMinutes,
}: {
  weeklyMinutes: number[];
  dailyGoalMinutes: number;
}) {
  const data = WEEK_DAYS.map((day, index) => ({
    day,
    minutes: weeklyMinutes[index] ?? 0,
    goal: dailyGoalMinutes,
  }));

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-white">Weekly Study Trend</h3>
        <p className="text-xs text-slate-500 mt-1">
          Daily study time compared with your goal.
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="day"
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${Math.floor(Number(value) / 60)}h`}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                const minutes = Number(payload[0].value ?? 0);

                return (
                  <div className="rounded-xl border border-white/10 bg-[#070B14] px-3 py-2 shadow-xl">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="text-sm font-semibold text-white">
                      {formatMinutes(minutes)}
                    </div>
                    <div className="text-xs text-violet-400">
                      Goal: {formatMinutes(dailyGoalMinutes)}
                    </div>
                  </div>
                );
              }}
            />

            <Bar
              dataKey="minutes"
              radius={[10, 10, 0, 0]}
              fill="#7C3AED"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}