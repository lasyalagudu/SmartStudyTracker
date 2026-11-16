"use client";

import { useState } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice, formatDuration } from "@/lib/mentorUtils";
import type { BookingStatus } from "@/types/mentor";

interface Booking {
  id: string;
  scheduledAt: string | Date;
  durationMins: number;
  status: BookingStatus;
  amountInPaise: number;
  meetingUrl: string | null;
  studentNote: string | null;
  student: { name: string | null; email: string };
  session: { title: string; durationMins: number } | null;
  payment: { status: string } | null;
  review: { rating: number } | null;
}

interface Props { bookings: Booking[] }

const STATUS_TABS: { id: BookingStatus | "ALL"; label: string }[] = [
  { id: "ALL",             label: "All" },
  { id: "CONFIRMED",       label: "Confirmed" },
  { id: "PENDING_PAYMENT", label: "Pending" },
  { id: "COMPLETED",       label: "Completed" },
  { id: "CANCELLED",       label: "Cancelled" },
];

export default function BookingsClient({ bookings: initial }: Props) {
  const [bookings, setBookings] = useState(initial);
  const [tab, setTab]           = useState<BookingStatus | "ALL">("ALL");
  const [meetingUrls, setMeetingUrls] = useState<Record<string, string>>(
    Object.fromEntries(initial.filter((b) => b.meetingUrl).map((b) => [b.id, b.meetingUrl!]))
  );

  const filtered = tab === "ALL" ? bookings : bookings.filter((b) => b.status === tab);

  async function patch(bookingId: string, data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/mentor/bookings/${bookingId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, ...updated.booking } : b));
      toast.success("Updated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-white">Bookings</h1>

      {/* Status tabs */}
      <div className="flex gap-1 bg-[#0A0F1E] border border-white/8 rounded-2xl p-1.5">
        {STATUS_TABS.map((t) => {
          const count = t.id === "ALL" ? bookings.length : bookings.filter((b) => b.status === t.id).length;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 py-1.5 rounded-xl text-xs font-medium transition-all",
                tab === t.id ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}>
              {t.label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Booking list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No bookings in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 space-y-3">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white font-semibold text-sm">{b.student.name ?? "Student"}</p>
                  <p className="text-slate-500 text-xs">{b.student.email}</p>
                  {b.session && <p className="text-slate-400 text-xs mt-0.5">{b.session.title}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={b.status} />
                  <p className="text-slate-500 text-xs mt-1">{formatPrice(b.amountInPaise)}</p>
                </div>
              </div>

              {/* Time + duration */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(b.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span>{formatDuration(b.durationMins)}</span>
                {b.review && (
                  <span className="text-amber-400">★ {b.review.rating}/5</span>
                )}
              </div>

              {/* Student note */}
              {b.studentNote && (
                <div className="text-xs text-slate-400 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/5">
                  <span className="text-slate-600">Note: </span>{b.studentNote}
                </div>
              )}

              {/* Meeting URL — editable for CONFIRMED */}
              {b.status === "CONFIRMED" && (
                <div className="flex gap-2">
                  <input
                    value={meetingUrls[b.id] ?? ""}
                    onChange={(e) => setMeetingUrls((prev) => ({ ...prev, [b.id]: e.target.value }))}
                    placeholder="Meeting URL (Zoom, Google Meet…)"
                    className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-violet-500/60"
                  />
                  <button
                    onClick={() => patch(b.id, { meetingUrl: meetingUrls[b.id] })}
                    className="px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-xl text-xs hover:bg-violet-600/30 transition-colors"
                  >
                    Save URL
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {b.status === "CONFIRMED" && (
                  <button onClick={() => patch(b.id, { status: "COMPLETED" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-medium hover:bg-green-600/30 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                )}
                {["CONFIRMED", "PENDING_PAYMENT"].includes(b.status) && (
                  <button onClick={() => patch(b.id, { status: "CANCELLED" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium hover:bg-red-600/30 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
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
