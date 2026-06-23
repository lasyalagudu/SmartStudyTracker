"use client";

import { useState } from "react";
import { Plus, Filter, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import SubjectTab from "@/components/syllabus/SubjectTab";
import TopicCard from "@/components/syllabus/TopicCard";
import AddSubjectDialog from "@/components/syllabus/AddSubjectDialog";
import AddTopicDialog from "@/components/syllabus/AddTopicDialog";
import OverallProgressPanel from "@/components/syllabus/OverallProgressPanel";

type FilterStatus = "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

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
    initialSubjects[0]?.id ?? null,
  );
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");

  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  const filteredTopics =
    activeSubject?.topics?.filter((topic: any) =>
      filterStatus === "ALL" ? true : topic.status === filterStatus,
    ) ?? [];

  function getSubjectProgress(subject: any) {
    const total = subject.topics?.length ?? 0;
    const done =
      subject.topics?.filter(
        (topic: any) => topic.status === "COMPLETED" || topic.mastered,
      ).length ?? 0;

    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  async function handleRenameSubject(subject: any) {
    const newName = prompt("Enter new subject name", subject.name);

    if (!newName?.trim()) return;

    const res = await fetch(`/api/syllabus/subject/${subject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        color: subject.color,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to rename subject");
      return;
    }

    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subject.id ? { ...s, name: data.subject.name } : s,
      ),
    );

    toast.success("Subject renamed!");
  }

  async function handleDeleteSubject(subject: any) {
    const confirmed = confirm(
      `Delete "${subject.name}" and all its topics? This cannot be undone.`,
    );

    if (!confirmed) return;

    const res = await fetch(`/api/syllabus/subject/${subject.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to delete subject");
      return;
    }

    const remainingSubjects = subjects.filter((s) => s.id !== subject.id);

    setSubjects(remainingSubjects);

    if (activeSubjectId === subject.id) {
      setActiveSubjectId(remainingSubjects[0]?.id ?? null);
    }

    toast.success("Subject deleted!");
  }

  async function updateTopic(
    topicId: string,
    field: string,
    value: boolean | string,
  ) {
    const res = await fetch(`/api/syllabus/topic/${topicId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ field, value }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Update failed");
      return;
    }

    setSubjects((prev) =>
      prev.map((subject) => ({
        ...subject,
        topics: subject.topics?.map((topic: any) =>
          topic.id === topicId ? data.topic : topic,
        ),
      })),
    );
  }

  async function handleRenameTopic(topic: any) {
    const newName = prompt("Enter new topic name", topic.name);

    if (!newName?.trim()) return;

    const res = await fetch(`/api/syllabus/topic/${topic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field: "name",
        value: newName.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to rename topic");
      return;
    }

    setSubjects((prev) =>
      prev.map((subject) => ({
        ...subject,
        topics: subject.topics?.map((t: any) =>
          t.id === topic.id ? data.topic : t,
        ),
      })),
    );

    toast.success("Topic renamed!");
  }

  async function handleDeleteTopic(topic: any) {
    const confirmed = confirm(`Delete "${topic.name}"? This cannot be undone.`);

    if (!confirmed) return;

    const res = await fetch(`/api/syllabus/topic/${topic.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to delete topic");
      return;
    }

    setSubjects((prev) =>
      prev.map((subject) => ({
        ...subject,
        topics: subject.topics?.filter((t: any) => t.id !== topic.id),
      })),
    );

    toast.success("Topic deleted!");
  }

  async function handleBulkMarkDone() {
    if (!activeSubjectId) return;

    const topics = activeSubject?.topics ?? [];

    const responses = await Promise.all(
      topics.map((topic: any) =>
        fetch(`/api/syllabus/topic/${topic.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bulkComplete: true }),
        }),
      ),
    );

    if (responses.some((res) => !res.ok)) {
      toast.error("Some topics failed to update");
      return;
    }

    const updated = await Promise.all(responses.map((res) => res.json()));

    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === activeSubjectId
          ? {
              ...subject,
              topics: subject.topics?.map((topic: any) => {
                const found = updated.find((u: any) => u.topic.id === topic.id);
                return found ? found.topic : topic;
              }),
            }
          : subject,
      ),
    );

    toast.success("All topics marked as done!");
  }

  const totalTopics = subjects.reduce(
    (acc, subject) => acc + (subject.topics?.length ?? 0),
    0,
  );

  const completedTopics = subjects.reduce(
    (acc, subject) =>
      acc +
      (subject.topics?.filter(
        (topic: any) => topic.status === "COMPLETED" || topic.mastered,
      ).length ?? 0),
    0,
  );

  const inProgressTopics = subjects.reduce(
    (acc, subject) =>
      acc +
      (subject.topics?.filter((topic: any) => topic.status === "IN_PROGRESS")
        .length ?? 0),
    0,
  );

  return (
    <div className="max-w-7xl">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Syllabus Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track every topic. Stay consistent. Master everything.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="appearance-none pl-8 pr-4 py-2 bg-[#0A0F1E] border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 cursor-pointer"
            >
              <option value="ALL">All</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowAddTopic(true)}
            disabled={!activeSubjectId}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> Add Topic
          </button>

          <button
            onClick={handleBulkMarkDone}
            disabled={!activeSubjectId}
            className="flex items-center gap-2 px-4 py-2 border border-violet-500/40 text-violet-300 rounded-xl text-sm font-medium hover:bg-violet-500/10 transition-colors disabled:opacity-40"
          >
            <CheckSquare className="w-4 h-4" /> Bulk Mark Done
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 pb-16 scrollbar-none overflow-visible">
        {subjects.map((subject) => (
          <SubjectTab
            key={subject.id}
            subject={subject}
            progress={getSubjectProgress(subject)}
            active={subject.id === activeSubjectId}
            onClick={() => setActiveSubjectId(subject.id)}
            onRename={handleRenameSubject}
            onDelete={handleDeleteSubject}
          />
        ))}

        <button
          onClick={() => setShowAddSubject(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-dashed border-white/20 rounded-xl text-sm text-slate-500 hover:border-violet-500/40 hover:text-violet-400 transition-all flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-3">
          {activeSubject && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">
                  {activeSubject.name} — {getSubjectProgress(activeSubject)}%
                  complete
                </h2>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${getSubjectProgress(activeSubject)}%` }}
                />
              </div>
            </div>
          )}

          {filteredTopics.map((topic: any) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onUpdate={updateTopic}
              onRename={handleRenameTopic}
              onDelete={handleDeleteTopic}
            />
          ))}

          {filteredTopics.length === 0 && (
            <div className="text-center py-16 text-slate-600">
              <div className="text-4xl mb-3">📚</div>
              {subjects.length === 0
                ? "Add a subject to get started."
                : activeSubjectId
                  ? 'No topics yet. Click "Add Topic" to add some!'
                  : "Select a subject to view topics."}
            </div>
          )}

          {activeSubjectId && (
            <button
              onClick={() => setShowAddTopic(true)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-400 transition-colors mt-2"
            >
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          )}
        </div>

        <OverallProgressPanel
          subjects={subjects}
          totalTopics={totalTopics}
          completedTopics={completedTopics}
          inProgressTopics={inProgressTopics}
        />
      </div>

      {showAddSubject && (
        <AddSubjectDialog
          examId={exam.id}
          userId={userId}
          nextOrder={subjects.length}
          onClose={() => setShowAddSubject(false)}
          onAdded={(subject) => {
            setSubjects([...subjects, { ...subject, topics: [] }]);
            setActiveSubjectId(subject.id);
            setShowAddSubject(false);
          }}
        />
      )}

      {showAddTopic && activeSubjectId && (
        <AddTopicDialog
          subjectId={activeSubjectId}
          subjectName={activeSubject?.name ?? ""}
          userId={userId}
          nextOrder={activeSubject?.topics?.length ?? 0}
          onClose={() => setShowAddTopic(false)}
          onAdded={(topics) => {
            setSubjects((prev) =>
              prev.map((subject) =>
                subject.id === activeSubjectId
                  ? {
                      ...subject,
                      topics: [...(subject.topics ?? []), ...topics],
                    }
                  : subject,
              ),
            );
            setShowAddTopic(false);
          }}
        />
      )}
    </div>
  );
}
