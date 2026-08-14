"use client";

import { Brain } from "lucide-react";

export default function MonthlyInsights({ insight }: { insight: string }) {
  return (
    <div className="bg-gradient-to-br from-violet-600/15 to-cyan-500/10 border border-violet-500/20 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-300">
          <Brain className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-white font-semibold">Monthly Review</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}