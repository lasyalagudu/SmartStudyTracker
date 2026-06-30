"use client";
import SubjectProgressBreakdown from "./SubjectProgressBreakdown";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import type { SubjectAnalyticsData, SubjectAnalyticsItem } from "@/types";
import SubjectSummaryCards from "./SubjectSummaryCards";

export default function SubjectAnalyticsClient() {
  const [data, setData] = useState<SubjectAnalyticsData | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/analytics/subjects");
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Failed to load subject analytics");
          return;
        }

        setData(json);
        setSelectedSubjectId(json.subjects?.[0]?.id ?? "");
      } catch {
        setError("Something went wrong while loading subject analytics");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#0A0F1E] border border-red-500/20 rounded-2xl p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-white font-semibold">Unable to load subjects</h3>
        <p className="text-sm text-slate-500 mt-1">{error}</p>
      </div>
    );
  }

  const selectedSubject: SubjectAnalyticsItem | undefined = data.subjects.find(
    (subject) => subject.id === selectedSubjectId,
  );

  if (data.subjects.length === 0) {
    return (
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-10 text-center">
        <div className="text-4xl mb-3">📚</div>
        <h3 className="text-white font-semibold">No subjects found</h3>
        <p className="text-sm text-slate-500 mt-1">
          Add subjects in Syllabus Tracker to see analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white">Subject Performance</h2>
        <p className="text-sm text-slate-500 mt-1">
          Analyze progress, confidence, weak topics, and next actions by
          subject.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {data.subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubjectId(subject.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border flex-shrink-0 transition-all ${
              selectedSubjectId === subject.id
                ? "bg-violet-600 text-white border-violet-500"
                : "bg-[#0A0F1E] text-slate-400 border-white/10 hover:text-white"
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {selectedSubject && (
        <SubjectSummaryCards
          totalTopics={selectedSubject.totalTopics}
          completedTopics={selectedSubject.completedTopics}
          totalStudyMinutes={selectedSubject.totalStudyMinutes}
          averageConfidence={selectedSubject.averageConfidence}
        />
      )}

      {selectedSubject && (
        <SubjectProgressBreakdown
          totalTopics={selectedSubject.totalTopics}
          breakdown={selectedSubject.breakdown}
        />
      )}
    </div>
  );
}
