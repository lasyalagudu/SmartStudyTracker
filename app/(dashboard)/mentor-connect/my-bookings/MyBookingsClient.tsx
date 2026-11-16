"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Star, ArrowLeft, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice, formatDuration, getInitials, examColor } from "@/lib/mentorUtils";
import type { BookingStatus } from "@/types/mentor";

interface BookingItem {
  id: string;
  scheduledAt: string | Date;
  durationMins: number;
  status: BookingStatus;
  amountInPaise: number;
  meetingUrl: string | null;
  mentor: { id: string; headline: string; photoUrl: string | null; primaryExam: string; user: { name: string | null } };
  session: { title: string; durationMins: number } | null;
  payment: { status: string } | null;
  review: { id: string; rating: number } | null;
}

interface Props { bookings: BookingItem[] }

export default function MyBookingsClient({ bookings: initial }: Props) {
  const [bookings, setBookings] = useState(initial);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating,    setReviewRating]    = useState(5);
  const [reviewComment,   setReviewComment]   = useState("");
  const [submitting,      setSubmitting]      = useState(false);

  async function cancelBooking(id: string) {
    try {
      const res = await fetch(`/api/mentor/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "CANCELLED" } : b));
      toast.success("Booking cancelled");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  async function submitReview(bookingId: string) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/mentor/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating: reviewRating, comment: reviewComment || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setBookings((prev) => prev.map((b) =>
        b.id === bookingId ? { ...b, review: { id: "new", rating: reviewRating } } : b
      ));
      setReviewBookingId(null);
      toast.success("Review submitted!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/mentor-connect" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Mentor Connect
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No bookings yet.</p>
          <Link href="/mentor-connect" className="text-violet-400 text-sm hover:underline">Browse mentors →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const accent = examColor(b.mentor.primaryExam);
            const isPast = new Date(b.scheduledAt) < new Date();
            return (
              <div key={b.id} className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
                <div className="flex items-start gap-4 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
                  >
                    {b.mentor.photoUrl
                      ? <img src={b.mentor.photoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                      : getInitials(b.mentor.user.name)
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{b.mentor.user.name ?? "Mentor"}</p>
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

                {/* Meeting URL — only for confirmed future sessions */}
                {b.status === "CONFIRMED" && !isPast && b.meetingUrl && (
                  <a href={b.meetingUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-cyan-400 hover:underline mb-3">
                    <Clock className="w-3 h-3" /> Join Meeting
                  </a>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  <Link href={`/mentor-connect/${b.mentor.id}`}
                    className="px-3 py-1.5 border border-white/10 text-slate-400 rounded-lg text-xs hover:bg-white/5">
                    View Profile
                  </Link>

                  {["PENDING_PAYMENT","CONFIRMED"].includes(b.status) && !isPast && (
                    <button onClick={() => cancelBooking(b.id)}
                      className="px-3 py-1.5 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/10">
                      Cancel
                    </button>
                  )}

                  {b.status === "COMPLETED" && !b.review && (
                    <button onClick={() => setReviewBookingId(b.id)}
                      className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/20 text-amber-400 rounded-lg text-xs hover:bg-amber-500/20">
                      Leave Review
                    </button>
                  )}

                  {b.review && (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" /> {b.review.rating}/5 Reviewed
                    </span>
                  )}
                </div>

                {/* Inline review form */}
                {reviewBookingId === b.id && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <button key={i} onClick={() => setReviewRating(i)}>
                          <Star className={cn("w-5 h-5 transition-colors",
                            i <= reviewRating ? "text-amber-400 fill-amber-400" : "text-white/20"
                          )} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience…"
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm resize-none focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setReviewBookingId(null)}
                        className="px-3 py-1.5 border border-white/10 text-slate-400 rounded-lg text-xs">Cancel</button>
                      <button onClick={() => submitReview(b.id)} disabled={submitting}
                        className="px-4 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium disabled:opacity-40">
                        Submit Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
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
