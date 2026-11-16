"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap, Briefcase, ShieldAlert,
  ChevronDown, Check, Clock, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MentorStatus } from "@/types/mentor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Workspace {
  id:    "student" | "mentor" | "admin";
  label: string;
  description: string;
  href:  string;
  icon:  React.ElementType;
  color: string;          // Tailwind text colour class
  bg:    string;          // Tailwind bg colour class (active indicator)
  available: boolean;
  badge?: string;         // small status chip text
  badgeCls?: string;      // Tailwind classes for the badge
}

interface Props {
  isApprovedMentor: boolean;
  isAdmin:          boolean;
  mentorStatus:     MentorStatus | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WorkspaceSwitcher({ isApprovedMentor, isAdmin, mentorStatus }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Determine current workspace ──────────────────────────────────────────
  const currentId = pathname.startsWith("/mentor-studio")
    ? "mentor"
    : pathname.startsWith("/admin")
    ? "admin"
    : "student";

  // ── Build workspace list ─────────────────────────────────────────────────
  const workspaces: Workspace[] = [
    {
      id:          "student",
      label:       "Student",
      description: "Study dashboard, planner & tracker",
      href:        "/dashboard",
      icon:        GraduationCap,
      color:       "text-violet-400",
      bg:          "bg-violet-600/15",
      available:   true,
    },
    {
      id:          "mentor",
      label:       "Mentor Studio",
      description: isApprovedMentor
        ? "Sessions, bookings & earnings"
        : mentorStatus === "PENDING_REVIEW"
        ? "Application under review"
        : mentorStatus === "REJECTED"
        ? "Application rejected — reapply"
        : "Apply to become a mentor",
      href: isApprovedMentor
        ? "/mentor-studio"
        : mentorStatus === "PENDING_REVIEW"
        ? "/mentor-connect?status=pending"
        : "/mentor-connect/become-mentor",
      icon:      Briefcase,
      color:     isApprovedMentor ? "text-cyan-400" : "text-slate-500",
      bg:        "bg-cyan-600/15",
      available: isApprovedMentor,
      badge: !isApprovedMentor
        ? mentorStatus === "PENDING_REVIEW"
          ? "Pending"
          : mentorStatus === "REJECTED"
          ? "Rejected"
          : mentorStatus === "DRAFT"
          ? "Draft"
          : "Apply"
        : undefined,
      badgeCls: mentorStatus === "PENDING_REVIEW"
        ? "bg-amber-500/20 text-amber-400"
        : mentorStatus === "REJECTED"
        ? "bg-red-500/20 text-red-400"
        : "bg-white/10 text-slate-400",
    },
    ...(isAdmin ? [{
      id:          "admin" as const,
      label:       "Admin Panel",
      description: "Approve mentors & verify achievements",
      href:        "/admin",
      icon:        ShieldAlert,
      color:       "text-amber-400",
      bg:          "bg-amber-600/15",
      available:   true,
    }] : []),
  ];

  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];

  return (
    <div ref={ref} className="relative px-3 mb-1">
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all",
          "hover:bg-white/5",
          open
            ? "bg-white/5 border-white/15"
            : "bg-white/[0.03] border-white/8"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {/* Icon */}
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", current.bg)}>
          <current.icon className={cn("w-3.5 h-3.5", current.color)} />
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-white leading-tight">{current.label}</p>
          <p className="text-[10px] text-slate-500 truncate leading-tight">{current.description}</p>
        </div>

        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-500 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className={cn(
          "absolute left-3 right-3 top-full mt-1.5 z-50",
          "bg-[#0D1526] border border-white/10 rounded-xl shadow-2xl shadow-black/40",
          "py-1.5 overflow-hidden",
        )}>
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider px-3 pb-1.5 pt-1">
            Switch workspace
          </p>

          {workspaces.map((ws) => {
            const isActive = ws.id === currentId;
            return (
              <Link
                key={ws.id}
                href={ws.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-lg transition-all",
                  isActive
                    ? "bg-white/5"
                    : ws.available
                    ? "hover:bg-white/5 cursor-pointer"
                    : "hover:bg-white/[0.03] cursor-pointer opacity-70"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                  isActive ? ws.bg : "bg-white/5"
                )}>
                  <ws.icon className={cn("w-3.5 h-3.5", isActive ? ws.color : "text-slate-500")} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-semibold",
                      isActive ? "text-white" : ws.available ? "text-slate-200" : "text-slate-400"
                    )}>
                      {ws.label}
                    </span>
                    {ws.badge && (
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", ws.badgeCls)}>
                        {ws.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600 truncate">{ws.description}</p>
                </div>

                {/* Active checkmark */}
                {isActive && <Check className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />}
              </Link>
            );
          })}

          {/* Mentor application CTA for users with no profile */}
          {!mentorStatus && !isApprovedMentor && (
            <div className="mx-1.5 mt-1 mb-0.5 px-3 py-2 bg-violet-600/10 border border-violet-500/20 rounded-lg">
              <p className="text-[10px] text-violet-300 font-medium">Are you a ranker / topper?</p>
              <Link
                href="/join-as-mentor"
                onClick={() => setOpen(false)}
                className="text-[10px] text-violet-400 hover:text-violet-300 hover:underline"
              >
                Apply to become a mentor →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
