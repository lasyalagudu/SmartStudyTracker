"use client";

import { useState } from "react";
import {
  BadgeCheck, Star, Clock, MapPin, Globe, Linkedin,
  ChevronDown, ChevronUp, CalendarDays, IndianRupee,
  BookOpen, Award, Lightbulb, MessageSquare, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  formatPrice, formatDuration, examColor, getInitials,
  DAY_LABELS, generateSlots, formatTime,
} from "@/lib/mentorUtils";
import type { MentorProfile, MentorSession } from "@/types/mentor";

interface Props {
  mentor: MentorProfile & {
    user: { name: string | null; email: string };
    exams: NonNullable<MentorProfile["exams"]>;
    achievements: NonNullable<MentorProfile["achievements"]>;
    sessions: NonNullable<MentorProfile["sessions"]>;
    availability: NonNullable<MentorProfile["availability"]>;
    reviews: NonNullable<MentorProfile["reviews"]>;
  };
  studentId: string;
}

type TabId = "overview" | "expertise" | "sessions" | "reviews";
const TABS: { id: TabId; label: string }[] = [
  { id: "overview",  label: "Overview" },
  { id: "expertise", label: "Expertise" },
  { id: "sessions",  label: "Sessions" },
  { id: "reviews",   label: "Reviews" },
];

export default function MentorProfileClient({ mentor, studentId }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [booking, setBooking]   = useState(false);
  const [bookingDone, setBookingDone] = useState<string | null>(null); // bookingId

  const accentColor = examColor(mentor.primaryExam);
  const primaryExam = mentor.exams[0];
  const hasVerified = mentor.achievements.length > 0;

  // Generate date options for next 14 days matching availability
  const dateOptions = (() => {
    const days: { label: string; value: string; dayKey: string }[] = [];
    const dayMap: Record<number, string> = { 1:"MON",2:"TUE",3:"WED",4:"THU",5:"FRI",6:"SAT",0:"SUN" };
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const key = dayMap[d.getDay()];
      if (mentor.availability.some((a) => a.dayOfWeek === key)) {
        days.push({
          label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
          value: d.toISOString().split("T")[0],
          dayKey: key,
        });
      }
    }
    return days;
  })();

  const slotsForDate = (() => {
    if (!selectedDate || !selectedSession) return [];
    const dayMap: Record<number, string> = { 1:"MON",2:"TUE",3:"WED",4:"THU",5:"FRI",6:"SAT",0:"SUN" };
    const d = new Date(selectedDate + "T00:00:00");
    const key = dayMap[d.getDay()];
    const avail = mentor.availability.find((a) => a.dayOfWeek === key);
    if (!avail) return [];
    return generateSlots(avail.startTime, avail.endTime, selectedSession.durationMins);
  })();

  async function handleBook() {
    if (!selectedSession || !selectedDate || !selectedSlot) {
      toast.error("Please select a session, date and time slot");
      return;
    }
    setBooking(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedSlot}:00`).toISOString();
      const res = await fetch("/api/mentor/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId:  mentor.id,
          sessionId: selectedSession.id,
          scheduledAt,
          studentNote: studentNote || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");

      const bookingId = data.booking.id;

      // Free session — done
      if (selectedSession.priceInPaise === 0) {
        setBookingDone(bookingId);
        toast.success("Session booked!");
        return;
      }

      // Paid — create Razorpay order
      const orderRes = await fetch("/api/mentor/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Payment failed");

      // Open Razorpay checkout
      await openRazorpay({
        orderId:   orderData.orderId,
        amount:    orderData.amount,
        keyId:     orderData.keyId,
        bookingId,
        name:      mentor.user.name ?? "Mentor",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBooking(false);
    }
  }

  async function openRazorpay({ orderId, amount, keyId, bookingId, name }: {
    orderId: string; amount: number; keyId: string; bookingId: string; name: string;
  }) {
    return new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        reject(new Error("Payment library not loaded. Please refresh the page."));
        return;
      }
      const rzp = new Razorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "SmartStudy Tracker",
        description: `Session with ${name}`,
        order_id: orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await fetch("/api/mentor/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId:  response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error);
            setBookingDone(bookingId);
            toast.success("Payment successful! Session confirmed.");
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        modal: { ondismiss: () => resolve() },
        prefill: {},
        theme: { color: "#7C3AED" },
      });
      rzp.open();
    });
  }

  return (
    <>
      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="max-w-4xl">
        {/* Back */}
        <Link
          href="/mentor-connect"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Mentors
        </Link>

        {/* Hero card */}
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`, border: `2px solid ${accentColor}40` }}
            >
              {mentor.photoUrl
                ? <img src={mentor.photoUrl} alt={mentor.user.name ?? ""} className="w-full h-full rounded-2xl object-cover" />
                : getInitials(mentor.user.name)
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-white">{mentor.user.name ?? "Mentor"}</h1>
                {hasVerified && (
                  <span className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-2 py-0.5">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified Achievement
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm mb-2">{mentor.headline}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                {mentor.college && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{mentor.college}</span>
                )}
                {mentor.languages.length > 0 && (
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{mentor.languages.join(", ")}</span>
                )}
                {mentor.linkedinUrl && (
                  <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline">
                    <Linkedin className="w-3 h-3" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {mentor.avgRating > 0 && (
                <div className="flex items-center gap-1 justify-end mb-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-bold">{mentor.avgRating.toFixed(1)}</span>
                  <span className="text-slate-500 text-xs">({mentor.totalReviews})</span>
                </div>
              )}
              {mentor.totalSessions > 0 && (
                <p className="text-xs text-slate-500">{mentor.totalSessions} sessions</p>
              )}
            </div>
          </div>

          {/* Exam tags */}
          {mentor.exams.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
              {mentor.exams.map((e) => (
                <span
                  key={e.id}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: `${examColor(e.examName)}20`, color: examColor(e.examName), border: `1px solid ${examColor(e.examName)}30` }}
                >
                  {e.examName} {e.examYear} {e.rank && `· AIR ${e.rank}`} {e.score && `· ${e.score}`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0A0F1E] border border-white/8 rounded-2xl p-1.5 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Section title="About">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{mentor.about}</p>
            </Section>

            {mentor.achievements.length > 0 && (
              <Section title="Achievements" icon={<Award className="w-4 h-4 text-amber-400" />}>
                <div className="space-y-3">
                  {mentor.achievements.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                      <BadgeCheck className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">{a.title}</p>
                        {a.description && <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>}
                      </div>
                      {a.fileUrl && (
                        <a href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="ml-auto text-xs text-violet-400 hover:underline flex-shrink-0">
                          View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}

        {activeTab === "expertise" && (
          <Section title="Areas of Expertise" icon={<Lightbulb className="w-4 h-4 text-violet-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "GATE / Exam Preparation Strategy",
                "Subject-wise Topic Guidance",
                "PYQ Analysis & Pattern Recognition",
                "Mock Test Review & Feedback",
                "Doubt Clearing Sessions",
                "Study Schedule Planning",
                "Interview Preparation",
                "College & Career Guidance",
              ].map((area) => (
                <div key={area} className="flex items-center gap-2.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{area}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {activeTab === "sessions" && (
          <div id="book" className="space-y-4">
            <h2 className="text-white font-semibold">Available Sessions</h2>
            {mentor.sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => { setSelectedSession(s); setSelectedDate(""); setSelectedSlot(""); }}
                className={cn(
                  "bg-[#0A0F1E] border rounded-2xl p-5 cursor-pointer transition-all",
                  selectedSession?.id === s.id
                    ? "border-violet-500 bg-violet-500/5"
                    : "border-white/8 hover:border-violet-500/30"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
                    {s.description && <p className="text-slate-400 text-xs mb-2">{s.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(s.durationMins)}</span>
                      <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{formatPrice(s.priceInPaise)}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center",
                    selectedSession?.id === s.id ? "border-violet-400 bg-violet-500" : "border-white/20"
                  )}>
                    {selectedSession?.id === s.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            ))}

            {/* Date + slot picker */}
            {selectedSession && (
              <div className="bg-[#0A0F1E] border border-violet-500/20 rounded-2xl p-5 space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-violet-400" />
                  Choose a Date
                </h3>

                {dateOptions.length === 0 ? (
                  <p className="text-slate-500 text-sm">This mentor has no availability set for the next 14 days.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {dateOptions.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => { setSelectedDate(d.value); setSelectedSlot(""); }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                            selectedDate === d.value
                              ? "bg-violet-600 border-violet-500 text-white"
                              : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    {selectedDate && slotsForDate.length > 0 && (
                      <>
                        <h3 className="text-white font-semibold flex items-center gap-2 pt-2">
                          <Clock className="w-4 h-4 text-violet-400" />
                          Choose a Time Slot
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {slotsForDate.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                                selectedSlot === slot
                                  ? "bg-violet-600 border-violet-500 text-white"
                                  : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                              )}
                            >
                              {formatTime(slot)}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {selectedSlot && (
                      <>
                        <textarea
                          value={studentNote}
                          onChange={(e) => setStudentNote(e.target.value)}
                          placeholder="Add a note for the mentor (optional) — e.g. topics to cover"
                          rows={2}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 resize-none"
                        />

                        {/* Summary */}
                        <div className="flex items-center justify-between py-3 px-4 bg-violet-600/10 border border-violet-500/20 rounded-xl">
                          <div>
                            <p className="text-white font-semibold text-sm">{selectedSession.title}</p>
                            <p className="text-slate-400 text-xs">
                              {new Date(selectedDate + "T" + selectedSlot + ":00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                              {" · "}{formatTime(selectedSlot)} · {formatDuration(selectedSession.durationMins)}
                            </p>
                          </div>
                          <p className="text-violet-300 font-bold text-lg">
                            {formatPrice(selectedSession.priceInPaise)}
                          </p>
                        </div>

                        {bookingDone ? (
                          <div className="text-center py-4">
                            <p className="text-green-400 font-semibold mb-2">✓ Booking Confirmed!</p>
                            <Link href="/mentor-connect/my-bookings" className="text-violet-400 text-sm hover:underline">
                              View My Bookings →
                            </Link>
                          </div>
                        ) : (
                          <button
                            onClick={handleBook}
                            disabled={booking}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:from-violet-500 hover:to-cyan-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {booking ? (
                              <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing…
                              </span>
                            ) : (
                              selectedSession.priceInPaise === 0
                                ? "Confirm Free Session"
                                : `Pay ${formatPrice(selectedSession.priceInPaise)} & Confirm`
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <Section title="Student Reviews" icon={<MessageSquare className="w-4 h-4 text-violet-400" />}>
            {mentor.reviews.length === 0 ? (
              <p className="text-slate-500 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {mentor.reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{r.student?.name ?? "Student"}</span>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className={cn("w-3 h-3", i <= r.rating ? "text-amber-400 fill-amber-400" : "text-white/20")} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-slate-400 text-sm">{r.comment}</p>}
                    <p className="text-slate-600 text-xs mt-2">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}
      </div>
    </>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
      <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        {icon}{title}
      </h2>
      {children}
    </div>
  );
}
