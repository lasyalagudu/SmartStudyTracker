"use client";

import { Brain } from "lucide-react";
import type { SubjectAnalyticsItem } from "@/types";

export default function SubjectInsight({
  subject,
}: {
  subject: SubjectAnalyticsItem;
}) {
  const weakCount = subject.weakTopics.length;

  let message = "";

  if (subject.totalTopics === 0) {
    message = "Add topics to this subject to start tracking performance.";
  } else if (subject.progress >= 80 && subject.averageConfidence >= 4) {
    message = `${subject.name} is in strong shape. Keep revising periodically to maintain your score.`;
  } else if (weakCount > 0) {
    message = `${subject.name} needs attention. Start with ${subject.weakTopics[0].name} and complete the next action: ${subject.weakTopics[0].nextAction}.`;
  } else if (subject.progress < 40) {
    message = `${subject.name} progress is still low. Focus on completing theory and problems first.`;
  } else {
    message = `${subject.name} is progressing steadily. Continue with PYQs and revision to improve readiness.`;
  }

  return (
    <div className="bg-gradient-to-br from-violet-600/15 to-cyan-500/10 border border-violet-500/20 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-300">
          <Brain className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-white font-semibold">Subject Insight</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}