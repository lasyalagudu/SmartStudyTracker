"use client";
import SubjectProgressBreakdown from "./SubjectProgressBreakdown";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import type { SubjectAnalyticsData, SubjectAnalyticsItem } from "@/types";
import SubjectSummaryCards from "./SubjectSummaryCards";
import WeakTopicsCard from "./WeakTopicsCard";
import TopicHealthTable from "./TopicHealthTable";
import SubjectInsight from "./SubjectInsight";

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
      <div className="space-y-6 animate-pulse">
        {/* Subject tab strip */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-white/5 border border-white/8 flex-shrink-0" />
          ))}
        </div>
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/8" />
          ))}
        </div>
        {/* Detail grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/8" />
          ))}
        </div>
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
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-12 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h3 className="text-white font-semibold text-lg mb-2">No subjects added yet</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          Add subjects and topics to your syllabus first. Subject analytics
          will populate automatically as you study and track progress.
        </p>
        <a
          href="/syllabus"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors"
        >
          Go to Syllabus Tracker →
        </a>
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
  <SubjectProgressBreakdown
    totalTopics={selectedSubject.totalTopics}
    breakdown={selectedSubject.breakdown}
  />

  <WeakTopicsCard
    topics={selectedSubject.weakTopics}
  />

  {selectedSubject && (
  <TopicHealthTable topics={selectedSubject.topicHealth} />
)}

{selectedSubject && <SubjectInsight subject={selectedSubject} />}
</div>
      )}
    </div>
  );
}
