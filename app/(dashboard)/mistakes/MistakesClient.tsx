"use client";

import { useState } from "react";
import { FileWarning, Plus, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";

const MISTAKE_TYPES = ["CONCEPTUAL", "CALCULATION", "CARELESS", "OTHER"] as const;

const TYPE_COLORS = {
  CONCEPTUAL: "#7C3AED",
  CALCULATION: "#2563EB",
  CARELESS: "#D97706",
  OTHER: "#475569",
};

export default function MistakesClient({
  mistakes: initialMistakes,
  subjects,
}: {
  mistakes: any[];
  subjects: any[];
}) {
  const [mistakes, setMistakes] = useState(initialMistakes);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] =
    useState<(typeof MISTAKE_TYPES)[number]>("CONCEPTUAL");
  const [subjectId, setSubjectId] = useState("");
  const [adding, setAdding] = useState(false);

  async function addMistake() {
    if (!title.trim()) return;

    setAdding(true);

    const res = await fetch("/api/mistakes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        description: desc || null,
        mistakeType: type,
        subjectId: subjectId || null,
      }),
    });

    const data = await res.json();
    setAdding(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to add mistake");
      return;
    }

    setMistakes([data.mistake, ...mistakes]);
    setTitle("");
    setDesc("");
    setType("CONCEPTUAL");
    setSubjectId("");
    setShowForm(false);
    toast.success("Mistake logged!");
  }

  async function toggleResolved(mistake: any) {
    const res = await fetch(`/api/mistakes/${mistake.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resolved: !mistake.resolved,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to update mistake");
      return;
    }

    setMistakes(
      mistakes.map((m) =>
        m.id === mistake.id ? { ...m, resolved: !m.resolved } : m
      )
    );
  }

  async function deleteMistake(id: string) {
    const res = await fetch(`/api/mistakes/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Failed to delete mistake");
      return;
    }

    setMistakes(mistakes.filter((m) => m.id !== id));
  }

  const pending = mistakes.filter((m) => !m.resolved);
  const resolved = mistakes.filter((m) => m.resolved);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mistakes Book</h1>
          <p className="text-slate-400 text-sm mt-1">
            Log mistakes. Revisit them. Never repeat them.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors"
        >
          <Plus className="w-4 h-4" /> Log Mistake
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: mistakes.length, color: "#7C3AED" },
          { label: "Pending", value: pending.length, color: "#D97706" },
          { label: "Resolved", value: resolved.length, color: "#059669" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-4 text-center"
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {mistakes.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <FileWarning className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <div className="text-sm">
            No mistakes logged yet. Start logging to learn faster!
          </div>
        </div>
      )}

      <div className="space-y-3">
        {mistakes.map((m) => (
          <div
            key={m.id}
            className={cn(
              "bg-[#0A0F1E] border rounded-xl p-4 transition-all",
              m.resolved
                ? "border-white/5 opacity-60"
                : "border-white/8 hover:border-violet-500/20"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${TYPE_COLORS[m.mistakeType as keyof typeof TYPE_COLORS]}20`,
                      color: TYPE_COLORS[m.mistakeType as keyof typeof TYPE_COLORS],
                    }}
                  >
                    {m.mistakeType}
                  </span>

                  {m.subject && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${m.subject.color}20`,
                        color: m.subject.color,
                      }}
                    >
                      {m.subject.name}
                    </span>
                  )}

                  {m.resolved && (
                    <span className="text-xs text-green-400">✓ Resolved</span>
                  )}
                </div>

                <div
                  className={cn(
                    "text-sm font-medium",
                    m.resolved ? "line-through text-slate-500" : "text-white"
                  )}
                >
                  {m.title}
                </div>

                {m.description && (
                  <div className="text-xs text-slate-500 mt-1">
                    {m.description}
                  </div>
                )}

                <div className="text-xs text-slate-600 mt-2">
                  {formatDate(m.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleResolved(m)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    m.resolved
                      ? "text-green-400 bg-green-500/10"
                      : "text-slate-500 hover:text-green-400 hover:bg-green-500/10"
                  )}
                >
                  <Check className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deleteMistake(m.id)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Log Mistake</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Title / Description
                </label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What went wrong?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Notes optional
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Add more details..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MISTAKE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-medium border transition-all",
                        type === t
                          ? "text-white"
                          : "border-white/10 text-slate-500 hover:text-slate-300"
                      )}
                      style={
                        type === t
                          ? {
                              background: `${TYPE_COLORS[t]}20`,
                              borderColor: `${TYPE_COLORS[t]}50`,
                              color: TYPE_COLORS[t],
                            }
                          : {}
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {subjects.length > 0 && (
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    Subject optional
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60 transition-all"
                  >
                    <option value="">No subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-white/15 text-slate-300 rounded-xl text-sm hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  onClick={addMistake}
                  disabled={!title.trim() || adding}
                  className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}