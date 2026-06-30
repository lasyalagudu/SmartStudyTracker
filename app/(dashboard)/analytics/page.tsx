"use client";

import { useState } from "react";

import AnalyticsShell from "@/components/analytics/layout/AnalyticsShell";
import AnalyticsHeader from "@/components/analytics/layout/AnalyticsHeader";
import AnalyticsTabs from "@/components/analytics/layout/AnalyticsTabs";

import WeeklyAnalyticsClient from "@/components/analytics/weekly/WeeklyAnalyticsClient";

type AnalyticsTab = "Overview" | "Daily" | "Weekly" | "Monthly" | "Subjects";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("Weekly");

  return (
    <AnalyticsShell>
      <AnalyticsHeader />

      <AnalyticsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "Overview" && (
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-10 text-center">
          <h2 className="text-white text-xl font-semibold">
            Overview Analytics
          </h2>

          <p className="text-slate-500 mt-2">Coming in the next sprint.</p>
        </div>
      )}

      {activeTab === "Daily" && (
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-10 text-center">
          <h2 className="text-white text-xl font-semibold">Daily Analytics</h2>

          <p className="text-slate-500 mt-2">Coming in the next sprint.</p>
        </div>
      )}

      {activeTab === "Weekly" && <WeeklyAnalyticsClient />}

      {activeTab === "Monthly" && (
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-10 text-center">
          <h2 className="text-white text-xl font-semibold">
            Monthly Analytics
          </h2>

          <p className="text-slate-500 mt-2">Coming in the next sprint.</p>
        </div>
      )}

      {activeTab === "Subjects" && (
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-10 text-center">
          <h2 className="text-white text-xl font-semibold">
            Subject Analytics
          </h2>

          <p className="text-slate-500 mt-2">Coming in the next sprint.</p>
        </div>
      )}
    </AnalyticsShell>
  );
}
