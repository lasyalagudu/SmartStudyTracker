"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import type { Topic } from "@/types";
import { toast } from "sonner";

interface Props {
  subjectId: string;
  subjectName: string;
  userId?: string;
  nextOrder: number;
  onClose: () => void;
  onAdded: (topics: Topic[]) => void;
}

export default function AddTopicDialog({
  subjectId,
  subjectName,
  nextOrder,
  onClose,
  onAdded,
}: Props) {
  const [commaSep, setCommaSep] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);

  function getTopicsFromComma() {
    return commaSep
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function getTopicsFromPaste() {
    return pasteText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  const previewTopics = commaSep ? getTopicsFromComma() : getTopicsFromPaste();

  async function handleAdd() {
    if (previewTopics.length === 0) return;

    setLoading(true);

    const res = await fetch("/api/syllabus/topic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjectId,
        topics: previewTopics.map((name, index) => ({
          name,
          order: nextOrder + index,
        })),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to add topics");
      return;
    }

    toast.success(
      `${data.topics.length} topic${data.topics.length > 1 ? "s" : ""} added!`
    );

    onAdded(data.topics as Topic[]);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white text-lg">
            Add Topics to {subjectName}
          </h3>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Add multiple topics at once to save time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 mb-6">
          <div>
            <div className="text-sm font-semibold text-slate-200 mb-1">
              Option 1: Quick add
            </div>
            <div className="text-xs text-slate-500 mb-2">
              Add multiple topics separated by commas
            </div>

            <textarea
              value={commaSep}
              onChange={(e) => {
                setCommaSep(e.target.value);
                if (e.target.value) setPasteText("");
              }}
              placeholder="Normalization, ER Model, SQL, Transactions, Indexing"
              rows={5}
              className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition-all resize-none"
            />

            <p className="text-xs text-slate-600 mt-1">
              Tip: Use commas to add multiple topics
            </p>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 h-full">
              <div className="w-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-600 font-semibold px-3">
                OR
              </span>
              <div className="w-px flex-1 bg-white/10" />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-200 mb-1">
              Option 2: Paste topics
            </div>
            <div className="text-xs text-slate-500 mb-2">
              Paste multiple topics one per line
            </div>

            <textarea
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                if (e.target.value) setCommaSep("");
              }}
              placeholder={"Normalization\nER Model\nSQL\nTransactions\nIndexing"}
              rows={5}
              className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition-all resize-none"
            />

            <p className="text-xs text-slate-600 mt-1">
              You can paste from any source like syllabus PDF
            </p>
          </div>
        </div>

        {previewTopics.length > 0 && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 mb-5 flex items-center gap-2">
            <span className="text-xl">💡</span>
            <div>
              <span className="text-sm text-violet-200 font-medium">
                {previewTopics.length} topics will be added under {subjectName}
              </span>
              <p className="text-xs text-violet-400">
                You can edit, delete or reorder them anytime.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-white/15 text-slate-300 rounded-xl text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            disabled={previewTopics.length === 0 || loading}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add {previewTopics.length > 0 ? `${previewTopics.length} ` : ""}
            Topics
          </button>
        </div>
      </div>
    </div>
  );
}