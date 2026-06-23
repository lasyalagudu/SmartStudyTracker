"use client";

import { useState } from "react";
import type { Subject } from "@/types";
import { cn } from "@/lib/utils";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface Props {
  subject: Subject;
  progress: number;
  active: boolean;
  onClick: () => void;
  onRename: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export default function SubjectTab({
  subject,
  progress,
  active,
  onClick,
  onRename,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 pr-9 rounded-xl text-sm font-medium transition-all border",
          active
            ? "bg-[#0A0F1E] border-violet-500/50 text-white shadow-[0_0_15px_rgba(124,58,237,0.2)]"
            : "bg-transparent border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/15"
        )}
      >
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded-md"
          style={{
            background: active ? `${subject.color}30` : "rgba(255,255,255,0.06)",
            color: active ? subject.color : "#64748b",
          }}
        >
          {progress}%
        </span>
        {subject.name}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[9999] w-36 rounded-xl border border-white/10 bg-[#0A0F1E] shadow-2xl py-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onRename(subject);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            <Pencil className="w-4 h-4" />
            Rename
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete(subject);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}