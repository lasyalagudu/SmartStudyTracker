"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, CalendarDays, Timer, BarChart3,
  FileWarning, Settings, LogOut, Rocket, Crown, X, Users,
  GraduationCap, Clock, Star, IndianRupee, CalendarCheck,
  ShieldAlert, MessageSquare,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSidebar } from "./SidebarContext";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import type { MentorStatus } from "@/types/mentor";

// ─── Nav definitions ──────────────────────────────────────────────────────────

const STUDENT_NAV = [
  { href: "/dashboard",      label: "Dashboard",        icon: LayoutDashboard },
  { href: "/syllabus",       label: "Syllabus Tracker", icon: BookOpen },
  { href: "/planner",        label: "Daily Planner",    icon: CalendarDays },
  { href: "/timer",          label: "Study Timer",      icon: Timer },
  { href: "/analytics",      label: "Analytics",        icon: BarChart3 },
  { href: "/mistakes",       label: "Mistakes Book",    icon: FileWarning },
  { href: "/mentor-connect", label: "Mentor Connect",   icon: Users },
];

const MENTOR_NAV = [
  { href: "/mentor-studio",              label: "Studio Home",  icon: LayoutDashboard },
  { href: "/mentor-studio/profile",      label: "My Profile",   icon: GraduationCap },
  { href: "/mentor-studio/sessions",     label: "Sessions",     icon: BookOpen },
  { href: "/mentor-studio/availability", label: "Availability", icon: CalendarCheck },
  { href: "/mentor-studio/bookings",     label: "Bookings",     icon: Clock },
  { href: "/mentor-studio/inbox",        label: "Inbox",        icon: MessageSquare },
  { href: "/mentor-studio/earnings",     label: "Earnings",     icon: IndianRupee },
  { href: "/mentor-studio/reviews",      label: "Reviews",      icon: Star },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Admin Dashboard", icon: ShieldAlert },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isApprovedMentor: boolean;
  isAdmin:          boolean;
  mentorStatus:     MentorStatus | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Sidebar({ isApprovedMentor, isAdmin, mentorStatus }: SidebarProps) {
  const pathname  = usePathname();
  const { signOut } = useClerk();
  const { open, close } = useSidebar();

  const isMentorMode = pathname.startsWith("/mentor-studio");
  const isAdminMode  = pathname.startsWith("/admin");

  const navItems = isAdminMode
    ? ADMIN_NAV
    : isMentorMode
    ? MENTOR_NAV
    : STUDENT_NAV;

  // Workspace label for the logo area
  const workspaceLabel = isAdminMode
    ? "Admin Panel"
    : isMentorMode
    ? "Mentor Studio"
    : "Study Tracker";

  async function handleSignOut() {
    await signOut({ redirectUrl: "/" });
    toast.success("Signed out successfully");
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-64 bg-[#070B14] border-r border-white/5",
        "flex flex-col z-40 transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* ── Logo ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={close}>
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white leading-tight">Smart</div>
              <div className="font-bold text-sm text-white leading-tight">{workspaceLabel}</div>
            </div>
          </Link>
          <button
            onClick={close}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Workspace Switcher ─────────────────────────────────────────── */}
        <div className="pt-3 pb-1">
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider px-5 mb-1.5">
            Workspace
          </p>
          <WorkspaceSwitcher
            isApprovedMentor={isApprovedMentor}
            isAdmin={isAdmin}
            mentorStatus={mentorStatus}
          />
        </div>

        {/* ── Divider ────────────────────────────────────────────────────── */}
        <div className="mx-3 h-px bg-white/5 mb-1" />

        {/* ── Main nav ──────────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn("sidebar-item", active ? "sidebar-item-active" : "sidebar-item-inactive")}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Pro upsell — student mode only ────────────────────────────── */}
        {!isMentorMode && !isAdminMode && (
          <div className="mx-3 mb-3 bg-gradient-to-br from-violet-600/20 to-cyan-600/10 border border-violet-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
            </div>
            <ul className="space-y-1 mb-3">
              {["Advanced Analytics","Unlimited Subjects","Revision Reminders","Detailed Reports"].map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-green-400">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link
              href="/pro"
              onClick={close}
              className="block w-full py-2 text-center bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-semibold rounded-lg hover:from-violet-500 hover:to-violet-400 transition-all"
            >
              Upgrade Now →
            </Link>
          </div>
        )}

        {/* ── Bottom: settings + logout ──────────────────────────────────── */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-white/5 pt-3">
          <Link
            href="/settings"
            onClick={close}
            className={cn("sidebar-item", pathname === "/settings" ? "sidebar-item-active" : "sidebar-item-inactive")}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button onClick={handleSignOut} className="sidebar-item sidebar-item-inactive w-full text-left">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
