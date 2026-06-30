"use client";

import AnalyticsShell from "@/components/analytics/layout/AnalyticsShell";
import AnalyticsHeader from "@/components/analytics/layout/AnalyticsHeader";

import SummaryCards from "@/components/analytics/daily/SummaryCards";
import DailyGoalsCard from "@/components/analytics/daily/DailyGoalsCard";
import SubjectStudyCard from "@/components/analytics/daily/SubjectStudyCard";
import ProgressBreakdownCard from "@/components/analytics/daily/ProgressBreakdownCard";
import ProductivityCard from "@/components/analytics/daily/ProductivityCard";
import AIInsightCard from "@/components/analytics/daily/AIInsightCard";

interface Props {
  data: any;
}

export default function DailyAnalytics({ data }: Props) {
  return (
    <AnalyticsShell>

      <SummaryCards stats={data.stats} />

      <div className="grid gap-6 xl:grid-cols-2">

        <DailyGoalsCard stats={data.stats} />

        <SubjectStudyCard
          subjects={data.subjectStudyTime}
        />

        <ProgressBreakdownCard
          progress={data.progress}
        />

        <ProductivityCard
          score={data.productivityScore}
        />

      </div>

      <AIInsightCard
        insight={data.insight}
      />

    </AnalyticsShell>
  );
}