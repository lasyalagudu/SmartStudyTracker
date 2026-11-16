import type { Metadata } from "next";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatPrice, formatDuration } from "@/lib/mentorUtils";
import { IndianRupee, TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "Earnings | Mentor Studio" };

export default async function EarningsPage() {
  const status = await getUserMentorStatus();
  if (!status) redirect("/sign-in");

  const mentor = await prisma.mentorProfile.findUnique({
    where:  { userId: status.userId },
    select: { totalEarnings: true, totalSessions: true, avgRating: true, id: true },
  });
  if (!mentor) redirect("/mentor-connect/become-mentor");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const completedBookings = await prisma.mentorBooking.findMany({
    where:   { mentorId: mentor.id, status: "COMPLETED" },
    orderBy: { scheduledAt: "desc" },
    select: {
      id: true, scheduledAt: true, durationMins: true, amountInPaise: true,
      student: { select: { name: true } },
      session: { select: { title: true } },
    },
  });

  const thisMonthEarnings = completedBookings
    .filter((b) => new Date(b.scheduledAt) >= monthStart)
    .reduce((s, b) => s + b.amountInPaise, 0);

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEarnings = completedBookings
    .filter((b) => {
      const d = new Date(b.scheduledAt);
      return d >= lastMonthStart && d < monthStart;
    })
    .reduce((s, b) => s + b.amountInPaise, 0);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Earnings</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "This Month",  value: formatPrice(thisMonthEarnings),    icon: IndianRupee, color: "text-green-400" },
          { label: "Last Month",  value: formatPrice(lastMonthEarnings),    icon: TrendingUp,  color: "text-cyan-400" },
          { label: "All Time",    value: formatPrice(mentor.totalEarnings), icon: IndianRupee, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-4">
            <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
        <h2 className="text-white font-semibold text-sm mb-4">Transaction History</h2>
        {completedBookings.length === 0 ? (
          <p className="text-slate-500 text-sm">No completed sessions yet.</p>
        ) : (
          <div className="space-y-0">
            {completedBookings.map((b, i) => (
              <div key={b.id}
                className={`flex items-center justify-between py-3 ${i < completedBookings.length - 1 ? "border-b border-white/5" : ""}`}>
                <div>
                  <p className="text-white text-sm">{b.student.name ?? "Student"}</p>
                  <p className="text-slate-500 text-xs">
                    {b.session?.title} · {formatDuration(b.durationMins)} ·{" "}
                    {new Date(b.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <p className="text-green-400 font-semibold">+{formatPrice(b.amountInPaise)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
