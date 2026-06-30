"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  weeklyTrend: number[];
}

function formatMinutes(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs}h ${mins}m`;
}

export default function MonthlyProgressTrend({ weeklyTrend }: Props) {
  const data = weeklyTrend.map((minutes, index) => ({
    week: `Week ${index + 1}`,
    minutes,
  }));

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="mb-5">
        <h3 className="text-white font-semibold">Monthly Progress Trend</h3>
        <p className="text-sm text-slate-500 mt-1">
          Study time distribution across the month.
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => `${Math.floor(Number(value) / 60)}h`}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                const minutes = Number(payload[0].value ?? 0);

                return (
                  <div className="rounded-xl border border-white/10 bg-[#070B14] px-3 py-2 shadow-xl">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-semibold text-white">
                      {formatMinutes(minutes)}
                    </p>
                  </div>
                );
              }}
            />

            <Bar
              dataKey="minutes"
              fill="#7C3AED"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}