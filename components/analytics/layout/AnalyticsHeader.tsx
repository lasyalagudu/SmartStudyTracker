import { BarChart3 } from "lucide-react";

export default function AnalyticsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-violet-400" />

          <h1 className="text-3xl font-bold text-white">
            Analytics
          </h1>
        </div>

        <p className="text-slate-400 mt-2">
          Understand your progress, consistency and study habits.
        </p>
      </div>
    </div>
  );
}