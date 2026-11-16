"use client";

import { useState } from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import {
  Rocket, BadgeCheck, IndianRupee, Users, ChevronDown, ChevronUp,
  Star, Clock, Shield, ArrowRight, GraduationCap, BookOpen,
  CalendarCheck, BarChart3, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Static data ──────────────────────────────────────────────────────────────

const WHY_ITEMS = [
  {
    icon: IndianRupee,
    title: "Earn on your terms",
    body: "Set your own session prices and schedule. No platform tax on your first ₹10,000.",
    color: "text-green-400", bg: "bg-green-500/10",
  },
  {
    icon: BadgeCheck,
    title: "Verified achievement badge",
    body: "Your rank cards and scorecards are reviewed by our team and displayed prominently on your profile.",
    color: "text-cyan-400", bg: "bg-cyan-500/10",
  },
  {
    icon: Users,
    title: "Reach serious aspirants",
    body: "Students on SmartStudy Tracker are actively preparing — they're motivated and ready to invest in guidance.",
    color: "text-violet-400", bg: "bg-violet-500/10",
  },
  {
    icon: Star,
    title: "Build your reputation",
    body: "Reviews from students you help appear on your public profile, compounding your credibility over time.",
    color: "text-amber-400", bg: "bg-amber-500/10",
  },
];

const HOW_STEPS = [
  { step: "01", title: "Create your profile", body: "Sign up and fill in your exam rank, preparation strategy and areas of expertise." },
  { step: "02", title: "Get verified",        body: "Upload your rank card or scorecard. Our team verifies it within 1–3 business days." },
  { step: "03", title: "Set your sessions",   body: "Create session offerings — 30-min doubt clearing, 1-hour deep dives, mock test reviews — at your price." },
  { step: "04", title: "Start mentoring",     body: "Students browse, book and pay. You show up, mentor, and earn." },
];

const FEATURES = [
  { icon: BookOpen,      label: "Session management" },
  { icon: CalendarCheck, label: "Availability calendar" },
  { icon: Clock,         label: "Booking dashboard" },
  { icon: BarChart3,     label: "Earnings tracker" },
  { icon: MessageSquare, label: "Student reviews" },
  { icon: BadgeCheck,    label: "Verified profile badge" },
];

const FAQS = [
  {
    q: "Do I need to have cleared a specific exam?",
    a: "We welcome toppers and high rankers from GATE, JEE, NEET, UPSC, CAT, campus placements and other competitive exams. You should have genuine preparation experience to share.",
  },
  {
    q: "How much can I earn?",
    a: "That's entirely up to you — you set your own session prices. Many mentors charge ₹300–₹1000 per session. Consistent mentors with strong reviews earn ₹15,000–₹40,000 per month.",
  },
  {
    q: "How long does verification take?",
    a: "Usually 1–3 business days. We verify your uploaded rank card or scorecard manually to maintain profile quality.",
  },
  {
    q: "Can I still use the app as a student?",
    a: "Yes. You keep full access to the student workspace — study planner, syllabus tracker, timer, analytics — alongside Mentor Studio. Switch between them any time.",
  },
  {
    q: "What happens if my application is rejected?",
    a: "You'll receive a note explaining why. You can update your profile and achievements and resubmit. Common reasons are unclear documents or incomplete profiles.",
  },
  {
    q: "Is there a fee to join as a mentor?",
    a: "No. Creating a mentor profile is free. We take a small platform fee from completed paid sessions, clearly shown before you set prices.",
  },
];

const EXAMS = ["GATE CSE", "GATE ECE", "JEE Advanced", "NEET PG", "UPSC CSE", "CAT", "IBPS PO", "Campus Placements"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function JoinAsMentorClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-[#070B14] text-white">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#070B14]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">SmartStudy Tracker</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <button
              onClick={() => setShowSignUp(true)}
              className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-semibold rounded-lg hover:from-violet-500 hover:to-violet-400 transition-all"
            >
              Apply Now
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-600/15 border border-violet-500/25 rounded-full text-violet-300 text-xs font-semibold mb-6">
            <GraduationCap className="w-3.5 h-3.5" />
            Mentor Applications Open
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Your journey can{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              inspire someone else.
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Turn your exam experience into someone else&apos;s success. Guide aspiring students,
            share your preparation strategies and earn through personalized mentoring.
          </p>

          {/* Exam tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {EXAMS.map((exam) => (
              <span key={exam} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">
                {exam}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowSignUp(true)}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-900/30"
            >
              Become a Mentor <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/sign-in?redirect_url=/mentor-connect/become-mentor"
              className="flex items-center gap-2 px-6 py-3.5 border border-white/15 text-slate-300 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Already have an account? Apply here
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-slate-600 text-xs mt-6">
            Free to apply · Verified profiles only · 1–3 day review
          </p>
        </div>
      </section>

      {/* ── Why become a mentor ─────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            tag="Why mentor?"
            title="More than just extra income"
            subtitle="Mentoring on SmartStudy Tracker is a professional platform built for serious exam preparation."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {WHY_ITEMS.map(({ icon: Icon, title, body, color, bg }) => (
              <div key={title} className="flex gap-4 p-5 bg-[#0A0F1E] border border-white/8 rounded-2xl">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#080C18] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            tag="How it works"
            title="From application to first booking"
            subtitle="Four simple steps to start mentoring on SmartStudy Tracker."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_STEPS.map(({ step, title, body }) => (
              <div key={step} className="relative p-5 bg-[#0A0F1E] border border-white/8 rounded-2xl">
                <div className="text-4xl font-black text-white/5 mb-3 leading-none">{step}</div>
                <p className="text-white font-semibold text-sm mb-2">{title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mentor Studio features ───────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            tag="Mentor Studio"
            title="Everything you need to run a mentoring practice"
            subtitle="Purpose-built tools for managing sessions, students and earnings — all in one workspace."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 p-4 bg-[#0A0F1E] border border-white/8 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-violet-600/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-sm text-slate-300 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verification process ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#080C18] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            tag="Verification"
            title="How mentor verification works"
            subtitle="We verify every mentor manually to protect the quality of guidance students receive."
          />
          <div className="space-y-3">
            {[
              { icon: Shield,    title: "Submit your rank card or scorecard", body: "Upload a photo or PDF of your rank card, admit card with result, or official scorecard." },
              { icon: Clock,     title: "1–3 business day review",            body: "Our team reviews each application manually. You'll receive an email notification once a decision is made." },
              { icon: BadgeCheck,title: "Verified badge on your profile",    body: "Once verified, a Verified Achievement badge appears on your public profile, increasing student trust and bookings." },
              { icon: Users,     title: "Appear in mentor listings",         body: "Only verified mentors appear in the Mentor Connect discovery page, ensuring students see quality profiles." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 p-5 bg-[#0A0F1E] border border-white/8 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-cyan-600/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <SectionHeader
            tag="FAQ"
            title="Frequently asked questions"
          />
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#0A0F1E] border border-white/8 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span className="text-white font-medium text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5 bg-[#080C18]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-500/20">
            <GraduationCap className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to start mentoring?</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Join mentors who are already guiding students toward their exam goals.
            Your experience matters more than you think.
          </p>
          <button
            onClick={() => setShowSignUp(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-900/30"
          >
            Become a Mentor <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-slate-600 text-xs mt-4">
            Free to apply · No subscription · Verified profiles only
          </p>
        </div>
      </section>

      {/* ── Clerk SignUp Modal ───────────────────────────────────────────── */}
      {showSignUp && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowSignUp(false)}
        >
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowSignUp(false)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white text-sm"
            >
              Close ✕
            </button>
            <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-6">
              <div className="text-center mb-5">
                <p className="text-white font-semibold text-lg">Create your free account</p>
                <p className="text-slate-400 text-sm mt-1">
                  Takes 30 seconds. Already have one?{" "}
                  <Link
                    href="/sign-in?redirect_url=/mentor-connect/become-mentor"
                    className="text-violet-400 hover:underline"
                  >
                    Sign in →
                  </Link>
                </p>
              </div>
              <SignUp
                routing="hash"
                signInUrl="/sign-in"
                fallbackRedirectUrl="/sso-callback?intent=mentor"
                forceRedirectUrl="/sso-callback?intent=mentor"
                appearance={{
                  elements: {
                    cardBox:  "shadow-none",
                    card:     "bg-transparent border-0 shadow-none p-0",
                    headerTitle:    "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                    formFieldLabel:  "text-slate-300",
                    formFieldInput:  "bg-white/5 border-white/10 text-white placeholder:text-slate-500",
                    footerActionText: "text-slate-500",
                    footerActionLink: "text-violet-400 hover:text-violet-300",
                    formButtonPrimary: "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400",
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <span className="inline-block text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">
        {tag}
      </span>
      <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
      {subtitle && <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
    </div>
  );
}
