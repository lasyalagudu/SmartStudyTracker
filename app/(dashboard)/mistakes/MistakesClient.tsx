"use client";

import { useMemo, useState } from "react";
import {
  FileWarning,
  Plus,
  Check,
  X,
  Loader2,
  Search,
  Filter,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react";
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
  const [editingMistake, setEditingMistake] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<(typeof MISTAKE_TYPES)[number]>("CONCEPTUAL");
  const [subjectId, setSubjectId] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | (typeof MISTAKE_TYPES)[number]>("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");

  function resetForm() {
    setTitle("");
    setDesc("");
    setType("CONCEPTUAL");
    setSubjectId("");
    setEditingMistake(null);
    setShowForm(false);
  }

  function openEdit(mistake: any) {
    setEditingMistake(mistake);
    setTitle(mistake.title ?? "");
    setDesc(mistake.description ?? "");
    setType(mistake.mistakeType ?? "CONCEPTUAL");
    setSubjectId(mistake.subjectId ?? "");
    setShowForm(true);
  }

  async function saveMistake() {
    if (!title.trim()) return;

    setSaving(true);

    const url = editingMistake
      ? `/api/mistakes/${editingMistake.id}`
      : "/api/mistakes";

    const method = editingMistake ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: desc || null,
        mistakeType: type,
        subjectId: subjectId || null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to save mistake");
      return;
    }

    if (editingMistake) {
      setMistakes((prev) =>
        prev.map((m) => (m.id === editingMistake.id ? data.mistake : m))
      );
      toast.success("Mistake updated!");
    } else {
      setMistakes((prev) => [data.mistake, ...prev]);
      toast.success("Mistake logged!");
    }

    resetForm();
  }

  async function toggleResolved(mistake: any) {
    const res = await fetch(`/api/mistakes/${mistake.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: !mistake.resolved }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to update mistake");
      return;
    }

    setMistakes((prev) =>
      prev.map((m) => (m.id === mistake.id ? data.mistake ?? { ...m, resolved: !m.resolved } : m))
    );

    toast.success(!mistake.resolved ? "Mistake mastered!" : "Moved back to pending");
  }

  async function deleteMistake(id: string) {
    const ok = confirm("Delete this mistake? This cannot be undone.");
    if (!ok) return;

    const res = await fetch(`/api/mistakes/${id}`, { method: "DELETE" });

    if (!res.ok) {
      toast.error("Failed to delete mistake");
      return;
    }

    setMistakes((prev) => prev.filter((m) => m.id !== id));
    toast.success("Mistake deleted");
  }

  const filteredMistakes = useMemo(() => {
    return mistakes.filter((m) => {
      const matchesSearch =
        m.title?.toLowerCase().includes(search.toLowerCase()) ||
        m.description?.toLowerCase().includes(search.toLowerCase()) ||
        m.subject?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && !m.resolved) ||
        (statusFilter === "RESOLVED" && m.resolved);

      const matchesType = typeFilter === "ALL" || m.mistakeType === typeFilter;

      const matchesSubject =
        subjectFilter === "ALL" || m.subjectId === subjectFilter;

      return matchesSearch && matchesStatus && matchesType && matchesSubject;
    });
  }, [mistakes, search, statusFilter, typeFilter, subjectFilter]);

  const pending = mistakes.filter((m) => !m.resolved);
  const resolved = mistakes.filter((m) => m.resolved);

  const mostCommonType =
    mistakes.length > 0
      ? MISTAKE_TYPES.map((t) => ({
          type: t,
          count: mistakes.filter((m) => m.mistakeType === t).length,
        })).sort((a, b) => b.count - a.count)[0]
      : null;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Mistakes Book</h1>
          <p className="text-slate-400 text-sm mt-1">
            Turn every mistake into a revision advantage.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors"
        >
          <Plus className="w-4 h-4" /> Log Mistake
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Mistakes", value: mistakes.length, color: "#7C3AED" },
          { label: "Pending Review", value: pending.length, color: "#D97706" },
          { label: "Mastered", value: resolved.length, color: "#059669" },
          {
            label: "Common Type",
            value: mostCommonType?.type ?? "—",
            color: mostCommonType
              ? TYPE_COLORS[mostCommonType.type as keyof typeof TYPE_COLORS]
              : "#64748b",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5"
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mistakes..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/60"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Mastered</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/60"
          >
            <option value="ALL">All Types</option>
            {MISTAKE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/60"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {(search || statusFilter !== "ALL" || typeFilter !== "ALL" || subjectFilter !== "ALL") && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setTypeFilter("ALL");
              setSubjectFilter("ALL");
            }}
            className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-violet-400"
          >
            <RotateCcw className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      {mistakes.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <FileWarning className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <div className="text-sm text-slate-400">
            No mistakes logged yet.
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Start logging mistakes after practice sessions or mock tests.
          </p>
        </div>
      )}

      {mistakes.length > 0 && filteredMistakes.length === 0 && (
        <div className="text-center py-14 text-slate-600">
          <Filter className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <div className="text-sm">No mistakes match your filters.</div>
        </div>
      )}

      <div className="space-y-3">
        {filteredMistakes.map((m) => (
          <div
            key={m.id}
            className={cn(
              "bg-[#0A0F1E] border rounded-xl p-4 transition-all",
              m.resolved
                ? "border-green-500/15 opacity-70"
                : "border-white/8 hover:border-violet-500/20"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
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

                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      m.resolved
                        ? "bg-green-500/10 text-green-400"
                        : "bg-orange-500/10 text-orange-400"
                    )}
                  >
                    {m.resolved ? "Mastered" : "Needs Review"}
                  </span>
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
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {m.description}
                  </div>
                )}

                <div className="text-xs text-slate-600 mt-3">
                  Logged on {formatDate(m.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleResolved(m)}
                  title={m.resolved ? "Move to pending" : "Mark mastered"}
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
                  onClick={() => openEdit(m)}
                  title="Edit mistake"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deleteMistake(m.id)}
                  title="Delete mistake"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
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
              <h3 className="font-semibold text-white">
                {editingMistake ? "Edit Mistake" : "Log Mistake"}
              </h3>
              <button onClick={resetForm} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  What went wrong?
                </label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Used wrong formula in profit & loss"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Correction / Notes optional
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Write the correct concept or what to remember next time..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 resize-none"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Type</label>
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60"
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
                  onClick={resetForm}
                  className="flex-1 py-2.5 border border-white/15 text-slate-300 rounded-xl text-sm hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  onClick={saveMistake}
                  disabled={!title.trim() || saving}
                  className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {editingMistake ? "Save" : "Log"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}