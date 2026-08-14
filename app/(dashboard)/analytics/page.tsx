"use client";

import { useState } from "react";

import AnalyticsShell from "@/components/analytics/layout/AnalyticsShell";
import AnalyticsHeader from "@/components/analytics/layout/AnalyticsHeader";
import AnalyticsTabs from "@/components/analytics/layout/AnalyticsTabs";
import DailyAnalyticsClient from "./daily/DailyAnalyticsClient";
import WeeklyAnalyticsClient from "@/components/analytics/weekly/WeeklyAnalyticsClient";
import MonthlyAnalyticsClient from "@/components/analytics/monthly/MonthlyAnalyticsClient";
import SubjectAnalyticsClient from "@/components/analytics/subjects/SubjectAnalyticsClient";

type AnalyticsTab = "Overview" | "Daily" | "Weekly" | "Monthly" | "Subjects";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("Weekly");

  return (
    <AnalyticsShell>
      <AnalyticsHeader />

      <AnalyticsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "Overview" && (
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-10 text-center">
          <h2 className="text-white text-xl font-semibold">Overview Analytics</h2>
          <p className="text-slate-500 mt-2">Coming in the next sprint.</p>
        </div>
      )}

      {activeTab === "Daily" && <DailyAnalyticsClient />}

      {activeTab === "Weekly" && <WeeklyAnalyticsClient />}

      {/* Previously this tab had a redundant outer div with a duplicate
          activeTab === "Monthly" guard, causing double-conditional rendering
          and wrapping the component in an unnecessary card shell. */}
      {activeTab === "Monthly" && <MonthlyAnalyticsClient />}

      {activeTab === "Subjects" && <SubjectAnalyticsClient />}
    </AnalyticsShell>
  );
}
