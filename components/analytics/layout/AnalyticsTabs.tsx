"use client";

import { cn } from "@/lib/utils";

export const analyticsTabs = [
  "Overview",
  "Daily",
  "Weekly",
  "Monthly",
  "Subjects",
] as const;

export type AnalyticsTab = (typeof analyticsTabs)[number];

interface Props {
  activeTab: AnalyticsTab;
  onChange: (tab: AnalyticsTab) => void;
}

export default function AnalyticsTabs({ activeTab, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
      {analyticsTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "px-5 py-2 rounded-xl text-sm font-medium transition-all",
            activeTab === tab
              ? "bg-violet-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}