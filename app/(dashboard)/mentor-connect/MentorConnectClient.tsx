"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Star, Clock, IndianRupee, BadgeCheck, Filter, Users,
  ChevronDown, Sparkles, ArrowRight, BookOpen, GraduationCap,
  AlertCircle, CheckCircle, XCircle, ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, formatDuration, examColor, ratingLabel, getInitials } from "@/lib/mentorUtils";
import type { MentorCard, MentorStatus } from "@/types/mentor";

interface Props {
  userId: string;
  activeExamName: string | null;
  hasMentorProfile: boolean;
  mentorProfileStatus: MentorStatus | null;
  /** Passed when redirected from /mentor-studio guards: "pending" | "suspended" */
  statusNotice: string | null;
  isApprovedMentor: boolean;
  /** @deprecated kept for compatibility — use mentorProfileStatus */
  mentorProfileId?: string | null;
}

const SORT_OPTIONS = [
  { value: "rating",   label: "Top Rated" },
  { value: "sessions", label: "Most Sessions" },
  { value: "price",    label: "Lowest Price" },
];

const EXAM_FILTER_OPTIONS = [
  { value: "",             label: "All Exams" },
  { value: "GATE",         label: "GATE" },
  { value: "JEE",          label: "JEE" },
  { value: "NEET",         label: "NEET" },
  { value: "UPSC",         label: "UPSC" },
  { value: "CAT",          label: "CAT" },
  { value: "Placements",   label: "Placements" },
];

function MentorCardSkeleton() {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-white/10 rounded" />
          <div className="h-3 w-48 bg-white/5 rounded" />
          <div className="h-3 w-24 bg-white/5 rounded" />
        </div>
      </div>
      <div className="h-12 bg-white/5 rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-8 flex-1 bg-white/5 rounded-xl" />
        <div className="h-8 flex-1 bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star
          key={i}
          className={cn("w-3 h-3", i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-white/20")}
        />
      ))}
    </div>
  );
}

export default function MentorConnectClient({
  userId, activeExamName, hasMentorProfile, mentorProfileStatus,
  isApprovedMentor, statusNotice,
}: Props) {
  const [mentors, setMentors]       = useState<MentorCard[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [examFilter, setExamFilter] = useState(activeExamName ?? "");
  const [sort, setSort]             = useState("rating");
  const [minRating, setMinRating]   = useState(0);
  const [maxPrice, setMaxPrice]     = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)    params.set("search", search);
      if (examFilter) params.set("exam", examFilter);
      if (sort)      params.set("sort", sort);
      if (minRating) params.set("minRating", String(minRating));
      if (maxPrice)  params.set("maxPrice", maxPrice);

      const res  = await fetch(`/api/mentor?${params.toString()}`);
      const data = await res.json();
      setMentors(data.mentors ?? []);
    } catch {
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, [search, examFilter, sort, minRating, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(fetchMentors, 300);
    return () => clearTimeout(timer);
  }, [fetchMentors]);

  const mentorCTAContent = () => {
    if (!hasMentorProfile) {
      return { label: "Become a Mentor", href: "/mentor-connect/become-mentor", variant: "primary" as const };
    }
    if (mentorProfileStatus === "PENDING_REVIEW") {
      return { label: "Application Under Review", href: "/mentor-connect/become-mentor", variant: "ghost" as const };
    }
    if (mentorProfileStatus === "APPROVED") {
      return { label: "Open Mentor Studio", href: "/mentor-studio", variant: "secondary" as const };
    }
    if (mentorProfileStatus === "DRAFT" || mentorProfileStatus === "REJECTED") {
      return { label: "Continue Application", href: "/mentor-connect/become-mentor", variant: "primary" as const };
    }
    return null;
  };
  const cta = mentorCTAContent();

  // Status-specific notice banners (driven by ?status= query param set by
  // the mentor-studio layout guard when it redirects here)
  const noticeBanner = (() => {
    if (statusNotice === "pending") {
      return {
        icon: <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />,
        cls:  "bg-amber-500/10 border-amber-500/20",
        title: "Application Under Review",
        body:  "We're reviewing your mentor profile. Mentor Studio will unlock automatically once approved — usually 1–3 business days.",
      };
    }
    if (statusNotice === "suspended") {
      return {
        icon: <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />,
        cls:  "bg-red-500/10 border-red-500/20",
        title: "Account Suspended",
        body:  "Your mentor account has been suspended. Contact support if you believe this is a mistake.",
      };
    }
    // Show inline status for PENDING even without query param
    if (mentorProfileStatus === "PENDING_REVIEW" && !statusNotice) {
      return {
        icon: <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />,
        cls:  "bg-amber-500/10 border-amber-500/20",
        title: "Mentor Application Pending",
        body:  "Your application is being reviewed. You'll be notified by email once a decision is made.",
      };
    }
    if (mentorProfileStatus === "REJECTED") {
      return {
        icon: <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />,
        cls:  "bg-red-500/10 border-red-500/20",
        title: "Application Not Approved",
        body:  "Your previous application was not approved. Update your profile and resubmit.",
      };
    }
    if (isApprovedMentor) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />,
        cls:  "bg-green-500/10 border-green-500/20",
        title: "You're an approved mentor",
        body:  "Manage your sessions and bookings in Mentor Studio.",
      };
    }
    return null;
  })();

  return (
    <div className="max-w-6xl">
      {/* Application status notice */}
      {noticeBanner && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl mb-6 border ${noticeBanner.cls}`}>
          {noticeBanner.icon}
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{noticeBanner.title}</p>
            <p className="text-slate-400 text-xs mt-0.5">{noticeBanner.body}</p>
          </div>
          {isApprovedMentor && (
            <Link
              href="/mentor-studio"
              className="flex-shrink-0 px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-medium hover:bg-green-600/30 transition-colors"
            >
              Open Studio →
            </Link>
          )}
          {mentorProfileStatus === "REJECTED" && (
            <Link
              href="/mentor-connect/become-mentor"
              className="flex-shrink-0 px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-600/30 transition-colors"
            >
              Reapply →
            </Link>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" />
            Mentor Connect
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Learn from toppers who cracked
            {activeExamName ? <span className="text-violet-300 font-medium"> {activeExamName}</span> : " your exam"}.
            Book 1-on-1 sessions.
          </p>
        </div>
        {cta && (
          <Link
            href={cta.href}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              cta.variant === "primary"   && "bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400",
              cta.variant === "secondary" && "bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30",
              cta.variant === "ghost"     && "bg-white/5 border border-white/10 text-slate-400 cursor-default"
            )}
          >
            {cta.variant === "primary" && <Sparkles className="w-4 h-4" />}
            {cta.label}
          </Link>
        )}
      </div>

      {/* Search + Filter bar */}
      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, college, exam…"
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
            />
          </div>

          {/* Exam filter */}
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/60"
          >
            {EXAM_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#0A0F1E]">{o.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/60"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#0A0F1E]">{o.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters((p) => !p)}
            className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 text-sm hover:bg-white/8 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showFilters && "rotate-180")} />
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex gap-4 flex-wrap pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 whitespace-nowrap">Min Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none"
              >
                <option value={0}  className="bg-[#0A0F1E]">Any</option>
                <option value={3}  className="bg-[#0A0F1E]">3+</option>
                <option value={4}  className="bg-[#0A0F1E]">4+</option>
                <option value={4.5}className="bg-[#0A0F1E]">4.5+</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 whitespace-nowrap">Max Price (₹)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 1000"
                className="w-28 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-slate-500 text-sm mb-4">
          {mentors.length === 0 ? "No mentors found" : `${mentors.length} mentor${mentors.length !== 1 ? "s" : ""} found`}
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <MentorCardSkeleton key={i} />)
          : mentors.map((mentor) => <MentorCardComponent key={mentor.id} mentor={mentor} />)
        }
      </div>

      {/* Empty state */}
      {!loading && mentors.length === 0 && (
        <div className="text-center py-20">
          <GraduationCap className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No mentors yet</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Be the first mentor for this exam. Help fellow students with your experience.
          </p>
          <Link
            href="/mentor-connect/become-mentor"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            Become a Mentor
          </Link>
        </div>
      )}
    </div>
  );
}

function MentorCardComponent({ mentor }: { mentor: MentorCard }) {
  const primaryExam  = mentor.exams[0];
  const minSession   = mentor.sessions.sort((a, b) => a.priceInPaise - b.priceInPaise)[0];
  const hasVerified  = mentor.achievements.some((a) => a.status === "VERIFIED");
  const accentColor  = examColor(mentor.primaryExam);
  const label        = ratingLabel(mentor.avgRating);

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 flex flex-col hover:border-violet-500/30 transition-all group">
      {/* Avatar + name */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`, border: `1px solid ${accentColor}40` }}
        >
          {mentor.photoUrl
            ? <Image src={mentor.photoUrl} alt={mentor.user.name ?? ""} width={56} height={56} className="w-full h-full rounded-2xl object-cover" />
            : getInitials(mentor.user.name)
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-sm truncate">{mentor.user.name ?? "Mentor"}</h3>
            {hasVerified && (
              <span className="flex items-center gap-0.5 text-[10px] text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-1.5 py-0.5">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          {primaryExam && (
            <p className="text-xs mt-0.5" style={{ color: accentColor }}>
              {primaryExam.examName} {primaryExam.examYear}
              {primaryExam.rank && ` · AIR ${primaryExam.rank}`}
            </p>
          )}
          {mentor.college && (
            <p className="text-[11px] text-slate-500 truncate">{mentor.college}</p>
          )}
        </div>
      </div>

      {/* About */}
      <p className="text-[12px] text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-1">
        {mentor.about || mentor.headline}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
        {mentor.avgRating > 0 && (
          <div className="flex items-center gap-1">
            <StarRating rating={mentor.avgRating} />
            <span className="text-white font-medium">{mentor.avgRating.toFixed(1)}</span>
            {label && <span className="text-amber-400">· {label}</span>}
            <span>({mentor.totalReviews})</span>
          </div>
        )}
        {mentor.totalSessions > 0 && (
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {mentor.totalSessions} sessions
          </span>
        )}
      </div>

      {/* Sessions preview */}
      {mentor.sessions.length > 0 && (
        <div className="mb-4 p-3 bg-white/[0.03] rounded-xl border border-white/5">
          {mentor.sessions.slice(0, 2).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-0.5">
              <span className="text-[11px] text-slate-400 truncate flex-1 mr-2">{s.title}</span>
              <div className="flex items-center gap-2 text-[11px] flex-shrink-0">
                <span className="text-slate-600 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />{formatDuration(s.durationMins)}
                </span>
                <span className="text-violet-300 font-semibold">{formatPrice(s.priceInPaise)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price tag */}
      {minSession && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <IndianRupee className="w-3 h-3" />
          Starting at <span className="text-white font-semibold">{formatPrice(minSession.priceInPaise)}</span>
          <span>/ {formatDuration(minSession.durationMins)}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/mentor-connect/${mentor.id}`}
          className="flex-1 py-2 text-center border border-white/10 text-slate-300 rounded-xl text-xs font-medium hover:bg-white/5 transition-colors"
        >
          View Profile
        </Link>
        <Link
          href={`/mentor-connect/${mentor.id}#book`}
          className="flex-1 py-2 text-center bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-xs font-semibold hover:from-violet-500 hover:to-violet-400 transition-all flex items-center justify-center gap-1"
        >
          Book Session <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
