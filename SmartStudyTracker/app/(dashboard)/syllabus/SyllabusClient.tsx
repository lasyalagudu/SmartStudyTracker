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
  const [selectedSubjectForTopic, setSelectedSubjectForTopic] = useState<any | null>(
    initialSubjects[0] ?? null
  );

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<FilterValue>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<FilterValue>("ALL");
  const [sortBy, setSortBy] = useState("ORDER");

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

  const filteredSubjects = useMemo(() => {
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

    return subjects
      .map((subject) => {
        let topics = (subject.topics ?? []).map((topic: any) => ({
          ...topic,
          subject: {
            id: subject.id,
            name: subject.name,
            color: subject.color,
          },
        }));

        if (search.trim()) {
          const q = search.toLowerCase();
          topics = topics.filter((topic: any) =>
            topic.name.toLowerCase().includes(q)
          );
        }

        if (statusFilter !== "ALL") {
          topics = topics.filter((topic: any) => topic.status === statusFilter);
        }

        if (difficultyFilter !== "ALL") {
          topics = topics.filter(
            (topic: any) => topic.difficulty === difficultyFilter
          );
        }

        if (priorityFilter !== "ALL") {
          topics = topics.filter((topic: any) => topic.priority === priorityFilter);
        }

        if (sortBy === "PRIORITY") {
          topics.sort(
            (a: any, b: any) => priorityRank[b.priority] - priorityRank[a.priority]
          );
        }

        if (sortBy === "DIFFICULTY") {
          topics.sort(
            (a: any, b: any) =>
              difficultyRank[b.difficulty] - difficultyRank[a.difficulty]
          );
        }

        if (sortBy === "PROGRESS") {
          topics.sort((a: any, b: any) => readiness(b) - readiness(a));
        }

        if (sortBy === "ESTIMATED_HOURS") {
          topics.sort((a: any, b: any) => b.estimatedHours - a.estimatedHours);
        }

        return {
          ...subject,
          topics,
        };
      })
      .filter((subject) => subject.topics.length > 0 || !search.trim());
  }, [
    subjects,
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

  function openAddTopic(subject: any) {
    setSelectedSubjectForTopic(subject);
    setShowAddTopic(true);
  }

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
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddTopic={() => {
          if (!selectedSubjectForTopic && subjects.length === 0) {
            toast.error("Add a subject first");
            return;
          }

          setSelectedSubjectForTopic(selectedSubjectForTopic ?? subjects[0]);
          setShowAddTopic(true);
        }}
        disableAddTopic={subjects.length === 0}
      />

      <div className="flex justify-end">
        <button
          onClick={() => setShowAddSubject(true)}
          className="px-4 py-2 rounded-xl text-sm border border-dashed border-white/20 text-slate-500 hover:text-violet-400 hover:border-violet-500/40"
        >
          + Subject
        </button>
      </div>

      <TopicTable
        subjects={filteredSubjects}
        onSelectTopic={(topic) => setSelectedTopic(topic)}
        onAddTopic={openAddTopic}
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
            const subjectWithTopics = { ...subject, topics: [] };
            setSubjects((prev) => [...prev, subjectWithTopics]);
            setSelectedSubjectForTopic(subjectWithTopics);
            setShowAddSubject(false);
          }}
        />
      )}

      {showAddTopic && selectedSubjectForTopic && (
        <AddTopicDialog
          subjectId={selectedSubjectForTopic.id}
          subjectName={selectedSubjectForTopic.name}
          userId={userId}
          nextOrder={selectedSubjectForTopic.topics?.length ?? 0}
          onClose={() => setShowAddTopic(false)}
          onAdded={(topics) => {
            setSubjects((prev) =>
              prev.map((subject) =>
                subject.id === selectedSubjectForTopic.id
                  ? {
                      ...subject,
                      topics: [...(subject.topics ?? []), ...topics],
                    }
                  : subject
              )
            );

            setSelectedSubjectForTopic((prev: any) =>
              prev?.id === selectedSubjectForTopic.id
                ? {
                    ...prev,
                    topics: [...(prev.topics ?? []), ...topics],
                  }
                : prev
            );

            setShowAddTopic(false);
          }}
        />
      )}
    </div>
  );
}