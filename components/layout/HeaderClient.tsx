"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronDown, Plus, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export default function HeaderClient({
  profile,
  exams,
  activeExam,
}: {
  profile: any;
  exams: any[];
  activeExam: any;
}) {
  const [exam, setExam] = useState(activeExam);
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  async function switchExam(selectedExam: any) {
    setExam(selectedExam);
    setShowExamDropdown(false);

    await fetch("/api/exams/switch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: selectedExam.id }),
    });

    window.location.reload();
  }

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#070B14]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-30">
      <div />

      <div className="flex items-center gap-3">
        {exam && (
          <div className="relative">
            <button
              onClick={() => setShowExamDropdown(!showExamDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white hover:border-violet-500/40 transition-all"
            >
              {exam.name}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showExamDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0A0F1E] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                {exams.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => switchExam(item)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm transition-colors",
                      exam.id === item.id
                        ? "text-violet-400 bg-violet-500/10"
                        : "text-slate-300 hover:bg-white/5"
                    )}
                  >
                    {item.name}
                  </button>
                ))}

                <div className="my-1 border-t border-white/10" />

                <Link
                  href="/settings#exam-setup"
                  onClick={() => setShowExamDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-violet-300 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Edit Setup
                </Link>

                <Link
                  href="/settings#exam-setup"
                  onClick={() => setShowExamDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-violet-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Exam
                </Link>
              </div>
            )}
          </div>
        )}

        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5">
          <UserButton />

          <div className="hidden sm:block">
            <div className="text-sm font-medium text-white leading-tight">
              {profile?.name ?? "Scholar"}
            </div>
            <div className="text-xs text-violet-400">Level 8 Scholar</div>
          </div>
        </div>
      </div>
    </header>
  );
}