import type { Subject } from "@/types";
import { cn } from "@/lib/utils";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            background: active
              ? `${subject.color}30`
              : "rgba(255,255,255,0.06)",
            color: active ? subject.color : "#64748b",
          }}
        >
          {progress}%
        </span>

        {subject.name}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="w-36 border border-white/10 bg-[#0A0F1E]"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={() => onRename(subject)}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onDelete(subject)}
            className="cursor-pointer text-red-400 focus:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}