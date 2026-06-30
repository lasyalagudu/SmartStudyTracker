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
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<FilterValue>("ALL");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<FilterValue>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<FilterValue>("ALL");
  const [sortBy, setSortBy] = useState("ORDER");

  const allTopics = useMemo(() => {
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

  const filteredTopics = useMemo(() => {
    let result = [...allTopics];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (topic) =>
          topic.name.toLowerCase().includes(q) ||
          topic.subject?.name?.toLowerCase().includes(q)
      );
    }

    if (subjectFilter !== "ALL") {
      result = result.filter((topic) => topic.subject?.id === subjectFilter);
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
    allTopics,
    search,
    subjectFilter,
    statusFilter,
    difficultyFilter,
    priorityFilter,
    sortBy,
  ]);

  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter(
    (topic) => topic.status === "COMPLETED" || topic.mastered
  ).length;
  const inProgressTopics = allTopics.filter(
    (topic) => topic.status === "IN_PROGRESS"
  ).length;
  const estimatedHours = allTopics.reduce(
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

  const selectedSubject =
    subjectFilter !== "ALL"
      ? subjects.find((subject) => subject.id === subjectFilter)
      : subjects[0];

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

      <SyllabusFilterBar
        search={search}
        setSearch={setSearch}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        subjects={subjects}
        onAddSubject={() => setShowAddSubject(true)}
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
            setSubjectFilter(subject.id);
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