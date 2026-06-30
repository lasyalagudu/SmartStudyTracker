"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import SyllabusSummaryCards from "@/components/syllabus/layout/SyllabusSummaryCards";
import SyllabusFilterBar from "@/components/syllabus/layout/SyllabusFilterBar";
import TopicTable from "@/components/syllabus/table/TopicTable";
import TopicDrawer from "@/components/syllabus/drawer/TopicDrawer";

import AddSubjectDialog from "@/components/syllabus/dialogs/AddSubjectDialog";
import AddTopicDialog from "@/components/syllabus/dialogs/AddTopicDialog";

type FilterValue = "ALL" | string;

export default function SyllabusClient({
  userId,
  exam,
  subjects: initialSubjects,
}: {
  userId: string;
  exam: any;
  subjects: any[];
}) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [activeSubjectId, setActiveSubjectId] = useState(
    initialSubjects[0]?.id ?? ""
  );

  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<FilterValue>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<FilterValue>("ALL");
  const [sortBy, setSortBy] = useState("ORDER");

  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  const examTopics = useMemo(() => {
  return subjects.flatMap((subject) =>
    (subject.topics ?? []).map((topic: any) => ({
      ...topic,
      subject: {
        id: subject.id,
        name: subject.name,
        color: subject.color,
      },
    }))
  );
}, [subjects]);

const subjectTopics = useMemo(() => {
  if (!activeSubject) return [];

  return (activeSubject.topics ?? []).map((topic: any) => ({
    ...topic,
    subject: {
      id: activeSubject.id,
      name: activeSubject.name,
      color: activeSubject.color,
    },
  }));
}, [activeSubject]);

  const allTopics = useMemo(() => {
    if (!activeSubject) return [];

    return (activeSubject.topics ?? []).map((topic: any) => ({
      ...topic,
      subject: {
        id: activeSubject.id,
        name: activeSubject.name,
        color: activeSubject.color,
      },
    }));
  }, [activeSubject]);

  const filteredTopics = useMemo(() => {
    let result = [...subjectTopics];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((topic) =>
        topic.name.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((topic) => topic.status === statusFilter);
    }

    if (difficultyFilter !== "ALL") {
      result = result.filter((topic) => topic.difficulty === difficultyFilter);
    }

    if (priorityFilter !== "ALL") {
      result = result.filter((topic) => topic.priority === priorityFilter);
    }

    const priorityRank: Record<string, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const difficultyRank: Record<string, number> = {
      HARD: 3,
      MEDIUM: 2,
      EASY: 1,
    };

    function readiness(topic: any) {
      return [
        topic.theoryDone,
        topic.problemsDone,
        topic.pyqsDone,
        topic.revisionDone,
        topic.mastered,
      ].filter(Boolean).length;
    }

    if (sortBy === "PRIORITY") {
      result.sort(
        (a, b) => priorityRank[b.priority] - priorityRank[a.priority]
      );
    }

    if (sortBy === "DIFFICULTY") {
      result.sort(
        (a, b) => difficultyRank[b.difficulty] - difficultyRank[a.difficulty]
      );
    }

    if (sortBy === "PROGRESS") {
      result.sort((a, b) => readiness(b) - readiness(a));
    }

    if (sortBy === "ESTIMATED_HOURS") {
      result.sort((a, b) => b.estimatedHours - a.estimatedHours);
    }

    return result;
  }, [
    subjectTopics,
    search,
    statusFilter,
    difficultyFilter,
    priorityFilter,
    sortBy,
  ]);

  const totalTopics = examTopics.length;

const completedTopics = examTopics.filter(
  (topic) => topic.status === "COMPLETED" || topic.mastered
).length;

const inProgressTopics = examTopics.filter(
  (topic) => topic.status === "IN_PROGRESS"
).length;

const estimatedHours = examTopics.reduce(
  (sum, topic) => sum + (topic.estimatedHours ?? 0),
  0
);

  function updateTopicInState(updatedTopic: any) {
    setSubjects((prev) =>
      prev.map((subject) => ({
        ...subject,
        topics: subject.topics?.map((topic: any) =>
          topic.id === updatedTopic.id ? updatedTopic : topic
        ),
      }))
    );

    setSelectedTopic((prev: any) =>
      prev?.id === updatedTopic.id
        ? {
            ...updatedTopic,
            subject: prev.subject,
          }
        : prev
    );
  }

  const selectedSubject = subjects.find(
    (subject) => subject.id === activeSubjectId
  );

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Syllabus Tracker</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track topics, readiness, revision, resources, and weak areas.
        </p>
      </div>

      <SyllabusSummaryCards
        totalTopics={totalTopics}
        completedTopics={completedTopics}
        inProgressTopics={inProgressTopics}
        estimatedHours={estimatedHours}
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => {
              setActiveSubjectId(subject.id);
              setSelectedTopic(null);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex-shrink-0 ${
              activeSubjectId === subject.id
                ? "bg-violet-600 text-white border-violet-500"
                : "bg-[#0A0F1E] text-slate-400 border-white/10 hover:text-white hover:border-violet-500/30"
            }`}
          >
            {subject.name}
          </button>
        ))}

        <button
          onClick={() => setShowAddSubject(true)}
          className="px-4 py-2 rounded-xl text-sm border border-dashed border-white/20 text-slate-500 hover:text-violet-400 hover:border-violet-500/40 flex-shrink-0"
        >
          + Subject
        </button>
      </div>

      <SyllabusFilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddTopic={() => {
          if (!selectedSubject) {
            toast.error("Add or select a subject first");
            return;
          }
          setShowAddTopic(true);
        }}
        disableAddTopic={!selectedSubject}
      />

      <TopicTable
        topics={filteredTopics}
        onSelectTopic={(topic) => setSelectedTopic(topic)}
      />

      <TopicDrawer
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        onUpdated={updateTopicInState}
      />

      {showAddSubject && (
        <AddSubjectDialog
          examId={exam.id}
          userId={userId}
          nextOrder={subjects.length}
          onClose={() => setShowAddSubject(false)}
          onAdded={(subject) => {
            setSubjects((prev) => [...prev, { ...subject, topics: [] }]);
            setActiveSubjectId(subject.id);
            setShowAddSubject(false);
          }}
        />
      )}

      {showAddTopic && selectedSubject && (
        <AddTopicDialog
          subjectId={selectedSubject.id}
          subjectName={selectedSubject.name}
          userId={userId}
          nextOrder={selectedSubject.topics?.length ?? 0}
          onClose={() => setShowAddTopic(false)}
          onAdded={(topics) => {
            setSubjects((prev) =>
              prev.map((subject) =>
                subject.id === selectedSubject.id
                  ? {
                      ...subject,
                      topics: [...(subject.topics ?? []), ...topics],
                    }
                  : subject
              )
            );

            setShowAddTopic(false);
          }}
        />
      )}
    </div>
  );
}