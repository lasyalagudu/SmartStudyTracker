/**
 * lib/mentorUtils.ts
 * Pure utility functions for the Mentor Connect module.
 */

/** Convert paise (integer) to ₹ string, e.g. 50000 → "₹500" */
export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

/** Convert minutes to human label, e.g. 90 → "1 hr 30 min" */
export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/** Map exam name to colour accent for cards */
export function examColor(exam: string): string {
  const map: Record<string, string> = {
    GATE: "#7C3AED",
    GATE_CSE: "#7C3AED",
    GATE_ECE: "#0891B2",
    JEE: "#2563EB",
    NEET: "#059669",
    UPSC: "#D97706",
    CAT: "#DC2626",
    PLACEMENTS: "#DB2777",
    Placements: "#DB2777",
  };
  return map[exam] ?? "#7C3AED";
}

/** Star rating label */
export function ratingLabel(r: number): string {
  if (r >= 4.8) return "Top rated";
  if (r >= 4.5) return "Excellent";
  if (r >= 4.0) return "Very good";
  if (r >= 3.5) return "Good";
  return "";
}

/** Day-of-week display names */
export const DAY_LABELS: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

/** Convert "HH:MM" 24h to 12h display, e.g. "14:30" → "2:30 PM" */
export function formatTime(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

/** Generate bookable 30-min slot strings between startTime and endTime */
export function generateSlots(startTime: string, endTime: string, durationMins: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  while (cur + durationMins <= end) {
    const hh = String(Math.floor(cur / 60)).padStart(2, "0");
    const mm = String(cur % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    cur += durationMins;
  }
  return slots;
}

/** Check if a slot overlaps with existing confirmed bookings */
export function isSlotConflict(
  slotStart: Date,
  slotDurationMins: number,
  bookings: { scheduledAt: Date | string; durationMins: number; status: string }[]
): boolean {
  const slotEnd = new Date(slotStart.getTime() + slotDurationMins * 60000);
  return bookings
    .filter((b) => ["CONFIRMED", "PENDING_PAYMENT"].includes(b.status))
    .some((b) => {
      const bStart = new Date(b.scheduledAt);
      const bEnd = new Date(bStart.getTime() + b.durationMins * 60000);
      return slotStart < bEnd && slotEnd > bStart;
    });
}

/** Get initials for avatar fallback */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "M";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
