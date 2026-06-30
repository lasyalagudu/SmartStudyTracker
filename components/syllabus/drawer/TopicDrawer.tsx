"use client";

import { useEffect, useState } from "react";
import {
  X,
  CheckCircle2,
  BookOpen,
  Code2,
  FileText,
  RefreshCcw,
  Crown,
  Save,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Resource {
  id?: string;
  title: string;
  url: string;
}

interface Topic {
  id: string;
  name: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  theoryDone: boolean;
  problemsDone: boolean;
  pyqsDone: boolean;
  revisionDone: boolean;
  mastered: boolean;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedHours: number;
  confidence: number;
  notes?: string | null;
  doubts?: string | null;
  completedAt?: string | null;
  lastRevisedAt?: string | null;
  resources?: Resource[];
}

interface Props {
  topic: Topic | null;
  onClose: () => void;
  onUpdated: (topic: Topic) => void;
}

const progressItems = [
  { field: "theoryDone", label: "Theory", icon: BookOpen },
  { field: "problemsDone", label: "Problems", icon: Code2 },
  { field: "pyqsDone", label: "PYQs", icon: FileText },
  { field: "revisionDone", label: "Revision", icon: RefreshCcw },
  { field: "mastered", label: "Mastered", icon: Crown },
] as const;

function getNextAction(topic: Topic) {
  if (!topic.theoryDone) return "Read Theory";
  if (!topic.problemsDone) return "Solve Problems";
  if (!topic.pyqsDone) return "Attempt PYQs";
  if (!topic.revisionDone) return "Revise";
  if (!topic.mastered) return "Mark Mastered";
  return "Completed";
}

export default function TopicDrawer({ topic, onClose, onUpdated }: Props) {
  const [localTopic, setLocalTopic] = useState<Topic | null>(topic);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalTopic(topic);
  }, [topic]);

  if (!localTopic) return null;

  async function updateField(field: string, value: any) {
    if (!localTopic) return;

    setSaving(true);

    const res = await fetch(`/api/syllabus/topic/${localTopic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.error || "Update failed");
      return;
    }

    setLocalTopic(data.topic);
    onUpdated(data.topic);
  }

  async function saveDetails() {
    if (!localTopic) return;

    setSaving(true);

    const res = await fetch(`/api/syllabus/topic/${localTopic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty: localTopic.difficulty,
        priority: localTopic.priority,
        estimatedHours: localTopic.estimatedHours,
        confidence: localTopic.confidence,
        notes: localTopic.notes ?? "",
        doubts: localTopic.doubts ?? "",
        resources: localTopic.resources ?? [],
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to save details");
      return;
    }

    toast.success("Topic updated!");
    setLocalTopic(data.topic);
    onUpdated(data.topic);
  }

  function addResource() {
    setLocalTopic((prev) =>
      prev
        ? {
            ...prev,
            resources: [...(prev.resources ?? []), { title: "", url: "" }],
          }
        : prev
    );
  }

  function updateResource(index: number, field: "title" | "url", value: string) {
    setLocalTopic((prev) => {
      if (!prev) return prev;

      const resources = [...(prev.resources ?? [])];
      resources[index] = {
        ...resources[index],
        [field]: value,
      };

      return {
        ...prev,
        resources,
      };
    });
  }

  function removeResource(index: number) {
    setLocalTopic((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        resources: (prev.resources ?? []).filter((_, i) => i !== index),
      };
    });
  }

  const readiness = [
    localTopic.theoryDone,
    localTopic.problemsDone,
    localTopic.pyqsDone,
    localTopic.revisionDone,
    localTopic.mastered,
  ].filter(Boolean).length;

  const nextAction = getNextAction(localTopic);

  return (
   <div
    onClick={onClose}
    className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="h-full w-full max-w-xl bg-[#070B14] border-l border-white/10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
    >
        <div className="sticky top-0 z-10 bg-[#070B14]/95 backdrop-blur-md border-b border-white/8 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Topic Details</div>
              <h2 className="text-xl font-bold text-white">{localTopic.name}</h2>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-300">
                  {readiness}/5 readiness
                </span>

                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-300">
                  {localTopic.status.replace("_", " ")}
                </span>

                <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-300">
                  Next: {nextAction}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <section className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">Progress Checklist</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {progressItems.map((item) => {
                const Icon = item.icon;
                const checked = Boolean(localTopic[item.field]);

                return (
                  <button
                    key={item.field}
                    onClick={() => updateField(item.field, !checked)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                      checked
                        ? "border-green-500/30 bg-green-500/10 text-green-300"
                        : "border-white/10 bg-white/5 text-slate-400 hover:border-violet-500/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        checked ? "bg-green-500/20" : "bg-white/5"
                      )}
                    >
                      {checked ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>

                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">Topic Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  Difficulty
                </label>
                <select
                  value={localTopic.difficulty}
                  onChange={(e) =>
                    setLocalTopic({
                      ...localTopic,
                      difficulty: e.target.value as Topic["difficulty"],
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  Priority
                </label>
                <select
                  value={localTopic.priority}
                  onChange={(e) =>
                    setLocalTopic({
                      ...localTopic,
                      priority: e.target.value as Topic["priority"],
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  value={localTopic.estimatedHours}
                  onChange={(e) =>
                    setLocalTopic({
                      ...localTopic,
                      estimatedHours: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  Confidence
                </label>
                <select
                  value={localTopic.confidence}
                  onChange={(e) =>
                    setLocalTopic({
                      ...localTopic,
                      confidence: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white"
                >
                  <option value={0}>Not rated</option>
                  <option value={1}>⭐ 1/5</option>
                  <option value={2}>⭐⭐ 2/5</option>
                  <option value={3}>⭐⭐⭐ 3/5</option>
                  <option value={4}>⭐⭐⭐⭐ 4/5</option>
                  <option value={5}>⭐⭐⭐⭐⭐ 5/5</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">Study Kit</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  Quick Notes
                </label>
                <textarea
                  value={localTopic.notes ?? ""}
                  onChange={(e) =>
                    setLocalTopic({ ...localTopic, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Important formulas, reminders, concepts..."
                  className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  Doubts
                </label>
                <textarea
                  value={localTopic.doubts ?? ""}
                  onChange={(e) =>
                    setLocalTopic({ ...localTopic, doubts: e.target.value })
                  }
                  rows={3}
                  placeholder="Questions you need to clarify..."
                  className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-500">Resources</label>

                  <button
                    onClick={addResource}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                  >
                    <Plus className="w-3 h-3" />
                    Add Link
                  </button>
                </div>

                <div className="space-y-2">
                  {(localTopic.resources ?? []).map((resource, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input
                        value={resource.title}
                        onChange={(e) =>
                          updateResource(index, "title", e.target.value)
                        }
                        placeholder="Title"
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white"
                      />

                      <input
                        value={resource.url}
                        onChange={(e) =>
                          updateResource(index, "url", e.target.value)
                        }
                        placeholder="https://..."
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white"
                      />

                      <button
                        onClick={() => removeResource(index)}
                        className="p-2 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(localTopic.resources ?? []).length === 0 && (
                    <p className="text-xs text-slate-600">
                      No links added yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">Timeline</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 border border-white/8 p-3">
                <div className="text-xs text-slate-500">Completed On</div>
                <div className="text-sm text-white mt-1">
                  {localTopic.completedAt
                    ? new Date(localTopic.completedAt).toLocaleDateString()
                    : "Not completed"}
                </div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/8 p-3">
                <div className="text-xs text-slate-500">Last Revised</div>
                <div className="text-sm text-white mt-1">
                  {localTopic.lastRevisedAt
                    ? new Date(localTopic.lastRevisedAt).toLocaleDateString()
                    : "Not revised yet"}
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={saveDetails}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Topic Details
          </button>
        </div>
      </div>
    </div>
  );
}