"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  ArrowLeft,
  CheckCircle2,
  BarChart3,
  BookOpen,
  Bell,
  FileText,
  Zap,
  Lock,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";

const PRO_FEATURES = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Deep-dive reports on study patterns, topic readiness scores, and predicted performance.",
    color: "#7C3AED",
  },
  {
    icon: BookOpen,
    title: "Unlimited Subjects",
    description:
      "Add as many subjects and topics as your exam demands — no caps.",
    color: "#2563EB",
  },
  {
    icon: Bell,
    title: "Smart Revision Reminders",
    description:
      "Spaced repetition alerts tell you exactly which topics to revise and when.",
    color: "#059669",
  },
  {
    icon: FileText,
    title: "Detailed Performance Reports",
    description:
      "Exportable PDF reports with subject-wise scores, weak areas, and improvement trends.",
    color: "#D97706",
  },
  {
    icon: Zap,
    title: "AI Study Planner",
    description:
      "Automatically generates a day-by-day study plan based on your exam date and progress.",
    color: "#EC4899",
  },
  {
    icon: Lock,
    title: "PYQ Bank Integration",
    description:
      "Browse and attempt previous year questions mapped to your syllabus topics.",
    color: "#0891B2",
  },
];

const SOCIAL_PROOF = [
  { stat: "2,400+", label: "Students on waitlist" },
  { stat: "18 days", label: "Avg. to exam day" },
  { stat: "94%", label: "Report better focus" },
];

export default function ProPageClient() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-white">

      {/* Top nav */}
      <nav className="border-b border-white/5 px-4 lg:px-8 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2 text-sm font-semibold">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            SmartStudy Pro
          </span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-16 lg:py-24">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Early Access — Limited Spots
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Study smarter.{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Rank higher.
            </span>
          </h1>

          <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            SmartStudy Pro gives GATE and competitive exam students the tools
            used by top rankers — AI planning, spaced revision, deep analytics,
            and PYQ integration.
          </p>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            {SOCIAL_PROOF.map(({ stat, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Waitlist form */}
          <div className="max-w-md mx-auto">
            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
                <h3 className="font-semibold text-white text-lg">You're on the list!</h3>
                <p className="text-slate-400 text-sm text-center">
                  We'll email you the moment early access opens. Keep studying
                  — your dashboard is still fully available.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            ) : (
              <form onSubmit={joinWaitlist} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading" || !email.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {status === "loading" ? "Joining…" : "Join Waitlist"}
                  </button>
                </div>

                {status === "error" && (
                  <p className="text-red-400 text-xs text-center">{errorMsg}</p>
                )}

                <p className="text-xs text-slate-600 text-center">
                  No spam. Just one email when early access opens.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Features grid */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Everything in Free, plus
            </h2>
            <p className="text-slate-500 text-sm">
              Built specifically for GATE, CAT, UPSC, and other competitive exams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRO_FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6 hover:border-violet-500/20 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Free vs Pro comparison */}
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl overflow-hidden mb-20">
          <div className="grid grid-cols-3 text-center border-b border-white/8">
            <div className="p-5 text-sm font-medium text-slate-400">Feature</div>
            <div className="p-5 border-l border-white/8">
              <div className="text-sm font-semibold text-white">Free</div>
            </div>
            <div className="p-5 border-l border-white/8 bg-violet-500/5">
              <div className="flex items-center justify-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-violet-300">Pro</span>
              </div>
            </div>
          </div>

          {[
            ["Syllabus Tracker", true, true],
            ["Study Timer", true, true],
            ["Daily Planner", true, true],
            ["Mistakes Book", true, true],
            ["Basic Analytics", true, true],
            ["Subjects", "Up to 5", "Unlimited"],
            ["Advanced Analytics", false, true],
            ["Revision Reminders", false, true],
            ["AI Study Planner", false, true],
            ["Performance Reports", false, true],
            ["PYQ Bank", false, true],
          ].map(([feature, free, pro]) => (
            <div
              key={feature as string}
              className="grid grid-cols-3 text-center border-b border-white/5 last:border-0"
            >
              <div className="p-4 text-sm text-slate-400 text-left px-6">{feature}</div>
              <div className="p-4 border-l border-white/5 flex items-center justify-center">
                {free === true ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : free === false ? (
                  <span className="text-slate-700 text-lg leading-none">—</span>
                ) : (
                  <span className="text-xs text-slate-400">{free}</span>
                )}
              </div>
              <div className="p-4 border-l border-white/5 bg-violet-500/5 flex items-center justify-center">
                {pro === true ? (
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                ) : pro === false ? (
                  <span className="text-slate-700 text-lg leading-none">—</span>
                ) : (
                  <span className="text-xs text-violet-300 font-medium">{pro}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-br from-violet-600/20 to-cyan-600/10 border border-violet-500/20 rounded-2xl p-10">
          <Users className="w-10 h-10 text-violet-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Join 2,400+ students on the waitlist
          </h2>
          <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
            Early access members get Pro free for 3 months. Spots are limited
            — sign up now to lock in your place.
          </p>

          {status === "success" ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              You're on the waitlist!
            </div>
          ) : (
            <form
              onSubmit={joinWaitlist}
              className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Get Early Access
              </button>
            </form>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 lg:px-8 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} SmartStudy Tracker. Built for serious exam aspirants.
      </footer>
    </div>
  );
}
