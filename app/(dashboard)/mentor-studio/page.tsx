import type { Metadata } from "next";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Clock, CheckCircle, IndianRupee, Star,
  ArrowRight, CalendarDays, Users,
} from "lucide-react";
import Link from "next/link";
import { formatPrice, formatDuration } from "@/lib/mentorUtils";

export const metadata: Metadata = {
  title: "Mentor Studio | SmartStudy Tracker",
};

export default async function MentorStudioPage() {
  const status = await getUserMentorStatus();
  if (!status) redirect("/sign-in");

  const mentor = await prisma.mentorProfile.findUnique({
    where: { userId: status.userId },
    select: {
      id:            true,
      headline:      true,
      avgRating:     true,
      totalReviews:  true,
      totalSessions: true,
      totalEarnings: true,
      bookings: {
        where: {
          status: { in: ["CONFIRMED", "PENDING_PAYMENT", "COMPLETED"] },
        },
        orderBy: { scheduledAt: "desc" },
        take:    5,
        select: {
          id:          true,
          scheduledAt: true,
          durationMins: true,
          status:      true,
          amountInPaise: true,
          student: { select: { name: true } },
          session: { select: { title: true } },
        },
      },
      sessions: {
        where:   { isActive: true },
        orderBy: { priceInPaise: "asc" },
        take:    3,
        select: {
          id:          true,
          title:       true,
          durationMins: true,
          priceInPaise: true,
          _count:      { select: { bookings: true } },
        },
      },
    },
  });

  if (!mentor) redirect("/mentor-connect/become-mentor");

  const upcoming = mentor.bookings.filter(
    (b) =>
      ["CONFIRMED", "PENDING_PAYMENT"].includes(b.status) &&
      new Date(b.scheduledAt) > new Date()
  );
  const completed = mentor.bookings.filter((b) => b.status === "COMPLETED");

  const stats = [
    {
      label: "Upcoming",
      value: upcoming.length,
      icon: Clock,
      color: "text-cyan-400",
      href: "/mentor-studio/bookings",
    },
    {
      label: "Completed",
      value: completed.length,
      icon: CheckCircle,
      color: "text-green-400",
      href: "/mentor-studio/bookings",
    },
    {
      label: "Total Earned",
      value: formatPrice(mentor.totalEarnings),
      icon: IndianRupee,
      color: "text-amber-400",
      href: "/mentor-studio/earnings",
    },
    {
      label: "Avg Rating",
      value: mentor.avgRating > 0 ? `${mentor.avgRating.toFixed(1)} ★` : "—",
      icon: Star,
      color: "text-amber-400",
      href: "/mentor-studio/reviews",
    },
  ];

  const QUICK_LINKS = [
    { href: "/mentor-studio/sessions",     label: "Manage Sessions",    icon: Users },
    { href: "/mentor-studio/availability", label: "Set Availability",   icon: CalendarDays },
    { href: "/mentor-studio/bookings",     label: "View All Bookings",  icon: Clock },
    { href: "/mentor-studio/earnings",     label: "Earnings Report",    icon: IndianRupee },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {status.name?.split(" ")[0] ?? "Mentor"} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">{mentor.headline || "Your Mentor Studio"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-4 hover:border-violet-500/30 transition-all group"
          >
            <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Upcoming bookings */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Upcoming Sessions</h2>
          <Link href="/mentor-studio/bookings" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6 text-center">
            <Clock className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No upcoming sessions.</p>
            <Link href="/mentor-studio/availability" className="text-xs text-violet-400 hover:underline mt-2 inline-block">
              Set your availability →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.slice(0, 4).map((b) => (
              <div
                key={b.id}
                className="bg-[#0A0F1E] border border-white/8 rounded-xl px-4 py-3 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {b.student.name ?? "Student"}
                  </p>
                  <p className="text-slate-500 text-xs truncate">{b.session?.title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-xs font-medium">
                    {new Date(b.scheduledAt).toLocaleDateString("en-IN", {
                      weekday: "short", day: "numeric", month: "short",
                    })}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {new Date(b.scheduledAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                    {" · "}{formatDuration(b.durationMins)}
                  </p>
                </div>
                <span
                  className={
                    b.status === "CONFIRMED"
                      ? "text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium flex-shrink-0"
                      : "text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium flex-shrink-0"
                  }
                >
                  {b.status === "CONFIRMED" ? "Confirmed" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active sessions */}
      {mentor.sessions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Active Sessions</h2>
            <Link href="/mentor-studio/sessions" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {mentor.sessions.map((s) => (
              <div key={s.id} className="bg-[#0A0F1E] border border-white/8 rounded-xl p-4">
                <p className="text-white text-sm font-medium truncate">{s.title}</p>
                <p className="text-slate-500 text-xs mt-1">
                  {formatDuration(s.durationMins)} · {formatPrice(s.priceInPaise)}
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  {s._count.bookings} booking{s._count.bookings !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section>
        <h2 className="text-white font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-start gap-2 p-4 bg-[#0A0F1E] border border-white/8 rounded-xl hover:border-violet-500/30 transition-all"
            >
              <Icon className="w-4 h-4 text-violet-400" />
              <span className="text-white text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
