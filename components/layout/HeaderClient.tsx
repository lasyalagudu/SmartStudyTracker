"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronDown, Plus, Settings, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

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
  const { toggle } = useSidebar();
  const router = useRouter();

  async function switchExam(selectedExam: any) {
    setExam(selectedExam);
    setShowExamDropdown(false);

    await fetch("/api/exams/switch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: selectedExam.id }),
    });

    // router.refresh() re-runs all server components in the current route
    // without a full page reload — preserves scroll, client state, and is
    // significantly faster than window.location.reload().
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#070B14]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-6 z-30">

      {/* Hamburger — visible only on mobile */}
      <button
        onClick={toggle}
        className="lg:hidden p-2 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop left-spacer */}
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2 lg:gap-3">

        {/* Exam switcher */}
        {exam && (
          <div className="relative">
            <button
              onClick={() => setShowExamDropdown((v) => !v)}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs lg:text-sm text-white hover:border-violet-500/40 transition-all max-w-[140px] lg:max-w-none"
            >
              <span className="truncate">{exam.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>

            {showExamDropdown && (
              <>
                {/* Backdrop so clicking outside closes dropdown */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExamDropdown(false)}
                />
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
                    href="/settings"
                    onClick={() => setShowExamDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-violet-300 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Setup
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setShowExamDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-violet-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Exam
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Notification bell */}
        <button
          className="relative p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <UserButton />
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-white leading-tight">
              {profile?.name ?? "Scholar"}
            </div>
            <div className="text-xs text-violet-400">Study Tracker</div>
          </div>
        </div>

      </div>
    </header>
  );
}
