"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import type { Subject } from "@/types";
import { toast } from "sonner";
import { SUBJECT_COLORS } from "@/lib/constants";

interface Props {
  examId: string;
  userId?: string;
  nextOrder: number;
  onClose: () => void;
  onAdded: (subject: Subject) => void;
}

export default function AddSubjectDialog({
  examId,
  nextOrder,
  onClose,
  onAdded,
}: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!name.trim()) return;

    setLoading(true);

    const res = await fetch("/api/syllabus/subject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        examId,
        name: name.trim(),
        color,
        order: nextOrder,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to add subject");
      return;
    }

    toast.success(`${name} added!`);
    onAdded(data.subject);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">Add Subject</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 font-medium mb-2 block">
              Subject Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. DBMS, Operating Systems"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 font-medium mb-2 block">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {SUBJECT_COLORS.map((c, index) => (
                <button
                  key={`${c}-${index}`}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    background: c,
                    borderColor: color === c ? "white" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-white/15 text-slate-300 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleAdd}
              disabled={!name.trim() || loading}
              className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Subject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}