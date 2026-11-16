"use client";

import { useState } from "react";
import {
  LayoutDashboard, User, Award, BookOpen, CalendarDays,
  IndianRupee, Star, Clock, Check, X, Plus, Trash2,
  Loader2, Save, ChevronRight, BadgeCheck, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice, formatDuration, DAY_LABELS } from "@/lib/mentorUtils";
import type { MentorProfile, MentorSession, MentorBooking } from "@/types/mentor";

type Section = "overview" | "profile" | "achievements" | "sessions" | "availability" | "bookings" | "earnings" | "reviews";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "overview",     label: "Overview",      icon: LayoutDashboard },
  { id: "profile",      label: "My Profile",    icon: User },
  { id: "achievements", label: "Achievements",  icon: Award },
  { id: "sessions",     label: "My Sessions",   icon: BookOpen },
  { id: "availability", label: "Availability",  icon: CalendarDays },
  { id: "bookings",     label: "Bookings",      icon: Clock },
  { id: "earnings",     label: "Earnings",      icon: IndianRupee },
  { id: "reviews",      label: "Reviews",       icon: Star },
];

const DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"] as const;

interface Props {
  mentor: MentorProfile & {
    exams: NonNullable<MentorProfile["exams"]>;
    achievements: NonNullable<MentorProfile["achievements"]>;
    sessions: NonNullable<MentorProfile["sessions"]>;
    availability: NonNullable<MentorProfile["availability"]>;
    bookings: (MentorBooking & {
      student: { name: string | null; email: string };
      session: { title: string; durationMins: number; priceInPaise: number } | null;
      payment: { status: string } | null;
      review: { rating: number; comment: string | null } | null;
    })[];
    reviews: NonNullable<MentorProfile["reviews"]>;
  };
  userName: string | null;
}

export default function MentorDashboardClient({ mentor, userName }: Props) {
  const [section, setSection] = useState<Section>("overview");
  const isPending = mentor.status === "PENDING_REVIEW";
  const isDraft   = mentor.status === "DRAFT";
  const isApproved = mentor.status === "APPROVED";

  const upcomingBookings = mentor.bookings.filter((b) =>
    ["CONFIRMED","PENDING_PAYMENT"].includes(b.status) && new Date(b.scheduledAt) > new Date()
  );
  const completedBookings = mentor.bookings.filter((b) => b.status === "COMPLETED");

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mentor Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, {userName?.split(" ")[0] ?? "Mentor"}
          </p>
        </div>
        <StatusBadge status={mentor.status} />
      </div>

      {/* Status banner */}
      {(isPending || isDraft) && (
        <div className={cn(
          "flex items-start gap-3 p-4 rounded-2xl mb-6 border",
          isPending ? "bg-amber-500/10 border-amber-500/20" : "bg-white/5 border-white/10"
        )}>
          <AlertCircle className={cn("w-5 h-5 mt-0.5 flex-shrink-0", isPending ? "text-amber-400" : "text-slate-500")} />
          <div>
            <p className={cn("font-semibold text-sm", isPending ? "text-amber-300" : "text-slate-300")}>
              {isPending ? "Application Under Review" : "Profile in Draft"}
            </p>
            <p className="text-xs mt-0.5 text-slate-500">
              {isPending
                ? "Our team is reviewing your application. You'll be notified by email once approved."
                : "Complete your profile and submit for review to start accepting bookings."}
            </p>
          </div>
          {isDraft && (
            <Link href="/mentor-connect/become-mentor"
              className="ml-auto flex-shrink-0 px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg font-medium">
              Continue →
            </Link>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="w-44 flex-shrink-0 hidden md:block">
          <div className="space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  section === id
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile section select */}
        <div className="md:hidden mb-4 w-full">
          <select
            value={section}
            onChange={(e) => setSection(e.target.value as Section)}
            className="w-full px-3 py-2.5 bg-[#0A0F1E] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
          >
            {SECTIONS.map(({ id, label }) => (
              <option key={id} value={id} className="bg-[#0A0F1E]">{label}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {section === "overview" && (
            <OverviewSection mentor={mentor} upcomingBookings={upcomingBookings} completedCount={completedBookings.length} />
          )}
          {section === "profile" && (
            <ProfileSection mentor={mentor} />
          )}
          {section === "achievements" && (
            <AchievementsSection mentor={mentor} />
          )}
          {section === "sessions" && (
            <SessionsSection mentor={mentor} disabled={!isApproved} />
          )}
          {section === "availability" && (
            <AvailabilitySection mentor={mentor} disabled={!isApproved} />
          )}
          {section === "bookings" && (
            <BookingsSection bookings={mentor.bookings} />
          )}
          {section === "earnings" && (
            <EarningsSection mentor={mentor} completedBookings={completedBookings} />
          )}
          {section === "reviews" && (
            <ReviewsSection reviews={mentor.reviews as never} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-sections ────────────────────────────────────────────────────────────

function OverviewSection({ mentor, upcomingBookings, completedCount }: {
  mentor: MentorProfile;
  upcomingBookings: MentorBooking[];
  completedCount: number;
}) {
  const stats = [
    { label: "Upcoming Sessions",  value: upcomingBookings.length,                icon: Clock,         color: "text-cyan-400" },
    { label: "Completed Sessions", value: completedCount,                          icon: Check,         color: "text-green-400" },
    { label: "Total Earnings",     value: formatPrice(mentor.totalEarnings ?? 0),  icon: IndianRupee,   color: "text-amber-400" },
    { label: "Avg Rating",         value: mentor.avgRating > 0 ? `${mentor.avgRating.toFixed(1)} ★` : "—", icon: Star, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-4">
            <s.icon className={cn("w-5 h-5 mb-2", s.color)} />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <h3 className="text-white font-semibold mt-6">Upcoming Sessions</h3>
      {upcomingBookings.length === 0 ? (
        <p className="text-slate-500 text-sm">No upcoming sessions.</p>
      ) : (
        upcomingBookings.slice(0, 3).map((b) => (
          <div key={b.id} className="bg-[#0A0F1E] border border-white/8 rounded-xl p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{(b as never as { student: { name: string | null } }).student?.name ?? "Student"}</p>
              <p className="text-slate-500 text-xs">{new Date(b.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              b.status === "CONFIRMED" ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"
            )}>
              {b.status === "CONFIRMED" ? "Confirmed" : "Pending Payment"}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function ProfileSection({ mentor }: { mentor: MentorProfile }) {
  const [headline,    setHeadline]    = useState(mentor.headline);
  const [about,       setAbout]       = useState(mentor.about);
  const [college,     setCollege]     = useState(mentor.college);
  const [saving,      setSaving]      = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/mentor/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, about, college }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="My Profile">
      <Field label="Headline">
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputCls} />
      </Field>
      <Field label="About Me">
        <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={5} className={`${inputCls} resize-none`} />
      </Field>
      <Field label="College / Organisation">
        <input value={college} onChange={(e) => setCollege(e.target.value)} className={inputCls} />
      </Field>
      <SaveButton saving={saving} onClick={save} />
    </Card>
  );
}

function AchievementsSection({ mentor }: { mentor: Props["mentor"] }) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl,     setFileUrl]     = useState("");
  const [fileType,    setFileType]    = useState<"pdf" | "image" | "">("");
  const [adding,      setAdding]      = useState(false);
  const [achievements, setAchievements] = useState(mentor.achievements);

  async function add() {
    if (!title.trim()) { toast.error("Title required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/mentor/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, fileUrl: fileUrl || null, fileType: fileType || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAchievements((prev) => [data.achievement, ...prev]);
      setTitle(""); setDescription(""); setFileUrl(""); setFileType("");
      toast.success("Achievement added — pending admin verification");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Add Achievement / Certificate">
        <Field label="Title *"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="GATE 2025 Rank Card" className={inputCls} /></Field>
        <Field label="Description"><input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} /></Field>
        <Field label="File URL (optional)" hint="Upload to any public storage, paste URL here">
          <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." className={inputCls} />
        </Field>
        <Field label="File Type">
          <select value={fileType} onChange={(e) => setFileType(e.target.value as never)} className={inputCls}>
            <option value="" className="bg-[#0A0F1E]">Select...</option>
            <option value="pdf" className="bg-[#0A0F1E]">PDF</option>
            <option value="image" className="bg-[#0A0F1E]">Image</option>
          </select>
        </Field>
        <button onClick={add} disabled={adding}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium disabled:opacity-40">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Achievement
        </button>
      </Card>

      <div className="space-y-3">
        {achievements.map((a) => (
          <div key={a.id} className="bg-[#0A0F1E] border border-white/8 rounded-xl p-4 flex items-start gap-3">
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{a.title}</p>
              {a.description && <p className="text-slate-500 text-xs mt-0.5">{a.description}</p>}
              {a.fileUrl && <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:underline">View file</a>}
            </div>
            <StatusChip status={a.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionsSection({ mentor, disabled }: { mentor: Props["mentor"]; disabled: boolean }) {
  const [sessions, setSessions] = useState<MentorSession[]>(mentor.sessions);
  const [title,    setTitle]    = useState("");
  const [desc,     setDesc]     = useState("");
  const [duration, setDuration] = useState(60);
  const [price,    setPrice]    = useState(500);
  const [adding,   setAdding]   = useState(false);

  async function addSession() {
    if (!title.trim()) { toast.error("Title required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/mentor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc, durationMins: duration, priceInPaise: price * 100 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSessions((prev) => [...prev, data.session]);
      setTitle(""); setDesc(""); setDuration(60); setPrice(500);
      toast.success("Session created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  async function toggleSession(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/mentor/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !isActive } : s));
    } catch {
      toast.error("Failed to update session");
    }
  }

  return (
    <div className="space-y-4">
      {disabled && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
          Sessions can only be created once your profile is approved.
        </div>
      )}

      <Card title="Create New Session">
        <Field label="Session Title *"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. GATE Preparation Roadmap" className={inputCls} disabled={disabled} /></Field>
        <Field label="Description"><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className={`${inputCls} resize-none`} disabled={disabled} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration (minutes)">
            <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={15} max={480} className={inputCls} disabled={disabled} />
          </Field>
          <Field label="Price (₹)">
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={0} className={inputCls} disabled={disabled} />
          </Field>
        </div>
        <button onClick={addSession} disabled={adding || disabled}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium disabled:opacity-40">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Session
        </button>
      </Card>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className={cn("bg-[#0A0F1E] border rounded-xl p-4", s.isActive ? "border-white/8" : "border-white/5 opacity-60")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-white text-sm font-medium">{s.title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{formatDuration(s.durationMins)} · {formatPrice(s.priceInPaise)}</p>
              </div>
              <button
                onClick={() => toggleSession(s.id, s.isActive)}
                className={cn("text-xs px-2.5 py-1 rounded-lg border font-medium transition-all",
                  s.isActive ? "border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20" :
                    "border-white/10 text-slate-500 hover:text-white"
                )}
              >
                {s.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AvailabilitySection({ mentor, disabled }: { mentor: Props["mentor"]; disabled: boolean }) {
  const [slots, setSlots] = useState<{ dayOfWeek: string; startTime: string; endTime: string }[]>(
    mentor.availability.length > 0
      ? mentor.availability.map((a) => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime }))
      : []
  );
  const [saving, setSaving] = useState(false);

  function toggle(day: string) {
    if (slots.some((s) => s.dayOfWeek === day)) {
      setSlots(slots.filter((s) => s.dayOfWeek !== day));
    } else {
      setSlots([...slots, { dayOfWeek: day, startTime: "09:00", endTime: "17:00" }]);
    }
  }

  function updateSlot(day: string, field: "startTime" | "endTime", value: string) {
    setSlots(slots.map((s) => s.dayOfWeek === day ? { ...s, [field]: value } : s));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/mentor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Availability saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Weekly Availability">
      {disabled && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs mb-4">
          Available once your profile is approved.
        </div>
      )}
      <p className="text-slate-500 text-xs mb-4">Select days you&apos;re available and set time ranges.</p>
      <div className="space-y-2">
        {DAYS.map((day) => {
          const slot = slots.find((s) => s.dayOfWeek === day);
          return (
            <div key={day} className="flex items-center gap-3">
              <button
                onClick={() => toggle(day)}
                disabled={disabled}
                className={cn(
                  "w-20 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  slot ? "bg-violet-600/20 border-violet-500/40 text-violet-300" : "bg-white/5 border-white/10 text-slate-500"
                )}
              >
                {DAY_LABELS[day].slice(0, 3)}
              </button>
              {slot && (
                <div className="flex items-center gap-2 text-xs">
                  <input type="time" value={slot.startTime} onChange={(e) => updateSlot(day, "startTime", e.target.value)}
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none" />
                  <span className="text-slate-500">to</span>
                  <input type="time" value={slot.endTime} onChange={(e) => updateSlot(day, "endTime", e.target.value)}
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <SaveButton saving={saving} onClick={save} disabled={disabled} />
    </Card>
  );
}

function BookingsSection({ bookings }: { bookings: Props["mentor"]["bookings"] }) {
  async function updateBooking(bookingId: string, data: Record<string, string>) {
    try {
      const res = await fetch(`/api/mentor/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Booking updated");
      // Simple reload — could be made more surgical
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-12 h-12 text-slate-700 mx-auto mb-3" />
        <p className="text-slate-500">No bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div key={b.id} className="bg-[#0A0F1E] border border-white/8 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-white font-medium text-sm">{b.student?.name ?? "Student"}</p>
              <p className="text-slate-500 text-xs">{b.session?.title}</p>
              <p className="text-slate-600 text-xs">
                {new Date(b.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                {" · "}{formatDuration(b.durationMins)}
              </p>
            </div>
            <div className="text-right">
              <BookingStatusBadge status={b.status} />
              <p className="text-slate-500 text-xs mt-1">{formatPrice(b.amountInPaise)}</p>
            </div>
          </div>

          {/* Meeting URL input for confirmed bookings */}
          {b.status === "CONFIRMED" && (
            <MeetingUrlInput bookingId={b.id} current={b.meetingUrl} onSave={(url) => updateBooking(b.id, { meetingUrl: url })} />
          )}

          {/* Actions */}
          {b.status === "CONFIRMED" && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => updateBooking(b.id, { status: "COMPLETED" })}
                className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-medium hover:bg-green-600/30"
              >
                Mark Completed
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MeetingUrlInput({ bookingId, current, onSave }: { bookingId: string; current: string | null; onSave: (url: string) => void }) {
  const [url, setUrl] = useState(current ?? "");
  return (
    <div className="flex gap-2 mt-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Meeting URL (Zoom, Google Meet…)"
        className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-violet-500/60"
      />
      <button
        onClick={() => onSave(url)}
        className="px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-lg text-xs hover:bg-violet-600/30"
      >
        Save
      </button>
    </div>
  );
}

function EarningsSection({ mentor, completedBookings }: { mentor: MentorProfile; completedBookings: MentorBooking[] }) {
  const thisMonth = completedBookings.filter((b) => {
    const d = new Date(b.scheduledAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthEarnings = thisMonth.reduce((s, b) => s + b.amountInPaise, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-1">This Month</p>
          <p className="text-2xl font-bold text-white">{formatPrice(thisMonthEarnings)}</p>
        </div>
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-1">All Time</p>
          <p className="text-2xl font-bold text-white">{formatPrice(mentor.totalEarnings ?? 0)}</p>
        </div>
      </div>

      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3">Recent Transactions</h3>
        {completedBookings.slice(0, 10).map((b) => (
          <div key={b.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div>
              <p className="text-white text-xs">{new Date(b.scheduledAt).toLocaleDateString("en-IN")}</p>
              <p className="text-slate-500 text-xs">{formatDuration(b.durationMins)} session</p>
            </div>
            <p className="text-green-400 font-semibold text-sm">+{formatPrice(b.amountInPaise)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsSection({ reviews }: { reviews: NonNullable<MentorProfile["reviews"]> }) {
  return (
    <div className="space-y-3">
      {reviews.length === 0 && <p className="text-slate-500 text-sm">No reviews yet.</p>}
      {reviews.map((r) => (
        <div key={r.id} className="bg-[#0A0F1E] border border-white/8 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-medium text-sm">{r.student?.name ?? "Student"}</p>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className={cn("w-3 h-3", i <= r.rating ? "text-amber-400 fill-amber-400" : "text-white/20")} />
              ))}
            </div>
          </div>
          {r.comment && <p className="text-slate-400 text-sm">{r.comment}</p>}
          <p className="text-slate-600 text-xs mt-2">
            {new Date(r.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    DRAFT:          { label: "Draft",         cls: "bg-white/10 text-slate-400" },
    PENDING_REVIEW: { label: "Under Review",  cls: "bg-amber-500/15 text-amber-400" },
    APPROVED:       { label: "Approved",      cls: "bg-green-500/15 text-green-400" },
    REJECTED:       { label: "Rejected",      cls: "bg-red-500/15 text-red-400" },
    SUSPENDED:      { label: "Suspended",     cls: "bg-red-500/15 text-red-400" },
  };
  const c = cfg[status] ?? cfg.DRAFT;
  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", c.cls,
      status === "APPROVED" ? "border-green-500/30" : "border-white/10"
    )}>
      {c.label}
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    PENDING:  "bg-amber-500/15 text-amber-400 border-amber-500/20",
    VERIFIED: "bg-green-500/15 text-green-400 border-green-500/20",
    REJECTED: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0", cfg[status] ?? cfg.PENDING)}>
      {status === "PENDING" ? "Pending" : status === "VERIFIED" ? "✓ Verified" : "Rejected"}
    </span>
  );
}

function BookingStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    PENDING_PAYMENT: "bg-amber-500/15 text-amber-400",
    CONFIRMED:       "bg-green-500/15 text-green-400",
    COMPLETED:       "bg-cyan-500/15 text-cyan-400",
    CANCELLED:       "bg-red-500/15 text-red-400",
    PAYMENT_FAILED:  "bg-red-500/15 text-red-400",
    REFUNDED:        "bg-slate-500/15 text-slate-400",
  };
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg[status] ?? "bg-white/10 text-slate-400")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
      <h2 className="text-white font-semibold text-sm mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; hint?: string;children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SaveButton({ saving, onClick, disabled }: { saving: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving || disabled}
      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-violet-500 transition-colors"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      Save Changes
    </button>
  );
}

const inputCls = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60";
