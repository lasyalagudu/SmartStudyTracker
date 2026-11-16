"use client";

import { useState } from "react";
import { Plus, Loader2, Power, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice, formatDuration } from "@/lib/mentorUtils";
import type { MentorSession } from "@/types/mentor";

type SessionWithCount = MentorSession & { _count: { bookings: number } };

interface Props { sessions: SessionWithCount[] }

export default function SessionsClient({ sessions: initial }: Props) {
  const [sessions, setSessions] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New session form
  const [title,    setTitle]    = useState("");
  const [desc,     setDesc]     = useState("");
  const [duration, setDuration] = useState(60);
  const [price,    setPrice]    = useState(500);
  const [adding,   setAdding]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Edit state
  const [editTitle,    setEditTitle]    = useState("");
  const [editDesc,     setEditDesc]     = useState("");
  const [editDuration, setEditDuration] = useState(60);
  const [editPrice,    setEditPrice]    = useState(500);
  const [saving,       setSaving]       = useState(false);

  async function add() {
    if (!title.trim()) { toast.error("Title required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/mentor/sessions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, description: desc, durationMins: duration, priceInPaise: price * 100 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSessions((prev) => [...prev, { ...data.session, _count: { bookings: 0 } }]);
      setTitle(""); setDesc(""); setDuration(60); setPrice(500);
      setShowForm(false);
      toast.success("Session created");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setAdding(false); }
  }

  function startEdit(s: SessionWithCount) {
    setEditingId(s.id);
    setEditTitle(s.title);
    setEditDesc(s.description);
    setEditDuration(s.durationMins);
    setEditPrice(s.priceInPaise / 100);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/mentor/sessions/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title: editTitle, description: editDesc, durationMins: editDuration, priceInPaise: editPrice * 100 }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSessions((prev) => prev.map((s) => s.id === id
        ? { ...s, title: editTitle, description: editDesc, durationMins: editDuration, priceInPaise: editPrice * 100 }
        : s
      ));
      setEditingId(null);
      toast.success("Session updated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  async function toggle(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/mentor/sessions/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !isActive } : s));
    } catch { toast.error("Failed to update"); }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Sessions</h1>
        <button onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 transition-colors">
          <Plus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#0A0F1E] border border-violet-500/30 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-sm">Create Session</h2>
          <Field label="Title *">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. GATE Preparation Roadmap" className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="What will you cover?" className={`${inputCls} resize-none`} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration (minutes)">
              <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={15} max={480} className={inputCls} />
            </Field>
            <Field label="Price (₹)">
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={0} className={inputCls} />
            </Field>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-white/10 text-slate-400 rounded-xl text-sm hover:bg-white/5">Cancel</button>
            <button onClick={add} disabled={adding}
              className="flex items-center gap-2 px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </div>
        </div>
      )}

      {/* Sessions list */}
      {sessions.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-4">No sessions yet. Create your first session offering.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className={cn(
              "bg-[#0A0F1E] border rounded-2xl p-5",
              s.isActive ? "border-white/8" : "border-white/5 opacity-60"
            )}>
              {editingId === s.id ? (
                /* Inline edit */
                <div className="space-y-3">
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputCls} />
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" value={editDuration} onChange={(e) => setEditDuration(Number(e.target.value))} min={15} className={inputCls} />
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} min={0} className={inputCls} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="p-2 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                    <button onClick={() => saveEdit(s.id)} disabled={saving}
                      className="flex items-center gap-1 px-4 py-1.5 bg-violet-600 text-white rounded-lg text-xs disabled:opacity-40">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{s.title}</p>
                    {s.description && <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{s.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{formatDuration(s.durationMins)}</span>
                      <span className="text-violet-300 font-semibold">{formatPrice(s.priceInPaise)}</span>
                      <span className="text-slate-600">{s._count.bookings} bookings</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(s)} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggle(s.id, s.isActive)}
                      className={cn("p-1.5 rounded-lg transition-colors",
                        s.isActive ? "text-green-400 hover:bg-green-500/10" : "text-slate-500 hover:bg-white/5"
                      )}>
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60";
