"use client";

import { useState } from "react";
import { Save, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DAY_LABELS } from "@/lib/mentorUtils";
import type { MentorAvailability } from "@/types/mentor";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

interface Props {
  availability: MentorAvailability[];
  blockedDates: { date: string; reason: string }[];
}

export default function AvailabilityClient({ availability: initAvail, blockedDates: initBlocked }: Props) {
  const [slots, setSlots] = useState<{ dayOfWeek: string; startTime: string; endTime: string }[]>(
    initAvail.map((a) => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime }))
  );
  const [blocked, setBlocked] = useState(initBlocked);
  const [newBlockDate, setNewBlockDate]     = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleDay(day: string) {
    if (slots.some((s) => s.dayOfWeek === day)) {
      setSlots(slots.filter((s) => s.dayOfWeek !== day));
    } else {
      setSlots([...slots, { dayOfWeek: day, startTime: "09:00", endTime: "18:00" }]);
    }
  }

  function updateSlot(day: string, field: "startTime" | "endTime", val: string) {
    setSlots(slots.map((s) => s.dayOfWeek === day ? { ...s, [field]: val } : s));
  }

  function addBlockedDate() {
    if (!newBlockDate) return;
    if (blocked.some((b) => b.date === newBlockDate)) {
      toast.error("Date already blocked"); return;
    }
    setBlocked([...blocked, { date: newBlockDate, reason: newBlockReason }]);
    setNewBlockDate(""); setNewBlockReason("");
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/mentor/availability", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ slots, blockedDates: blocked }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Availability saved");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Availability</h1>

      {/* Weekly slots */}
      <section className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 space-y-3">
        <h2 className="text-white font-semibold">Weekly Schedule</h2>
        <p className="text-xs text-slate-500">Select days and set your available hours.</p>

        {DAYS.map((day) => {
          const slot = slots.find((s) => s.dayOfWeek === day);
          return (
            <div key={day} className="flex items-center gap-3 py-1">
              <button onClick={() => toggleDay(day)}
                className={cn(
                  "w-24 py-1.5 rounded-lg text-xs font-semibold border transition-all flex-shrink-0",
                  slot
                    ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                    : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"
                )}>
                {DAY_LABELS[day]}
              </button>
              {slot ? (
                <div className="flex items-center gap-2 text-xs flex-1">
                  <input type="time" value={slot.startTime} onChange={(e) => updateSlot(day, "startTime", e.target.value)}
                    className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none w-28" />
                  <span className="text-slate-500">to</span>
                  <input type="time" value={slot.endTime} onChange={(e) => updateSlot(day, "endTime", e.target.value)}
                    className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none w-28" />
                </div>
              ) : (
                <span className="text-xs text-slate-700">Not available</span>
              )}
            </div>
          );
        })}
      </section>

      {/* Blocked dates */}
      <section className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 space-y-3">
        <h2 className="text-white font-semibold">Blocked Dates</h2>
        <p className="text-xs text-slate-500">Days you won&apos;t be available (holidays, busy days).</p>

        <div className="flex gap-2">
          <input type="date" value={newBlockDate} onChange={(e) => setNewBlockDate(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500/60" />
          <input value={newBlockReason} onChange={(e) => setNewBlockReason(e.target.value)}
            placeholder="Reason (optional)" className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-violet-500/60" />
          <button onClick={addBlockedDate} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {blocked.length > 0 && (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {blocked.map((b) => (
              <div key={b.date} className="flex items-center justify-between gap-2 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg">
                <div>
                  <span className="text-white text-xs font-medium">
                    {new Date(b.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {b.reason && <span className="text-slate-500 text-xs ml-2">{b.reason}</span>}
                </div>
                <button onClick={() => setBlocked(blocked.filter((x) => x.date !== b.date))}
                  className="text-slate-600 hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 disabled:opacity-40 transition-colors">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Availability
      </button>
    </div>
  );
}
