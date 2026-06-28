"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LogStudyDialog({
  subjects,
  onClose,
  onSaved,
}: {
  subjects: any[];
  onClose: () => void;
  onSaved: (minutes: number, newStreak: number) => void;
}) {
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [subjectId, setSubjectId] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveLog() {
    const durationMinutes = hours * 60 + minutes;

    if (durationMinutes <= 0) {
      toast.error("Enter study time");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/study-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        durationMinutes,
        subjectId: subjectId || null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to log study");
      return;
    }

    toast.success("Study time logged!");
    onSaved(durationMinutes, data.streak);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0A0F1E] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Log Offline Study</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-5">
          Use this when you studied from books, phone, coaching, or offline.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Study Time
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                />
                <p className="text-xs text-slate-500 mt-1">Hours</p>
              </div>

              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                />
                <p className="text-xs text-slate-500 mt-1">Minutes</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Subject Optional
            </label>

            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            >
              <option value="">General Study</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={saveLog}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-500 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Study Log
          </button>
        </div>
      </div>
    </div>
  );
}