"use client";

import { useState } from "react";
import { Save, Loader2, Plus, X, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MentorProfile, MentorExam, MentorAchievement } from "@/types/mentor";

const EXAM_OPTIONS = [
  "GATE CSE", "GATE ECE", "JEE", "NEET", "UPSC", "CAT", "Placements", "Other",
];
const LANGUAGE_OPTIONS = [
  "English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati",
];

interface Props {
  mentor: MentorProfile & {
    exams: MentorExam[];
    achievements: MentorAchievement[];
  };
  userName: string | null;
}

export default function ProfileClient({ mentor, userName }: Props) {
  // Profile fields
  const [headline,        setHeadline]        = useState(mentor.headline);
  const [about,           setAbout]           = useState(mentor.about);
  const [photoUrl,        setPhotoUrl]        = useState(mentor.photoUrl ?? "");
  const [college,         setCollege]         = useState(mentor.college);
  const [languages,       setLanguages]       = useState<string[]>(mentor.languages);
  const [experienceYears, setExperienceYears] = useState(mentor.experienceYears);
  const [linkedinUrl,     setLinkedinUrl]     = useState(mentor.linkedinUrl ?? "");
  const [savingProfile,   setSavingProfile]   = useState(false);

  // Achievements
  const [achievements,   setAchievements] = useState(mentor.achievements);
  const [achTitle,       setAchTitle]     = useState("");
  const [achDesc,        setAchDesc]      = useState("");
  const [achFileUrl,     setAchFileUrl]   = useState("");
  const [addingAch,      setAddingAch]    = useState(false);

  function toggleLanguage(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/mentor/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline, about,
          photoUrl:        photoUrl || null,
          college,         languages,
          experienceYears, linkedinUrl: linkedinUrl || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function addAchievement() {
    if (!achTitle.trim()) { toast.error("Title required"); return; }
    setAddingAch(true);
    try {
      const res = await fetch("/api/mentor/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: achTitle, description: achDesc,
          fileUrl: achFileUrl || null,
          fileType: achFileUrl ? (achFileUrl.endsWith(".pdf") ? "pdf" : "image") : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAchievements((prev) => [data.achievement, ...prev]);
      setAchTitle(""); setAchDesc(""); setAchFileUrl("");
      toast.success("Achievement submitted — pending admin verification");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAddingAch(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      {/* ── Core profile ─────────────────────────────────────────────────── */}
      <section className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 space-y-4">
        <h2 className="text-white font-semibold">Profile Information</h2>

        <Field label="Name">
          <input value={userName ?? ""} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
          <p className="text-xs text-slate-600 mt-1">Synced from your account</p>
        </Field>

        <Field label="Headline *">
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={200} className={inputCls} placeholder="e.g. GATE CSE AIR 142 | IIT Hyderabad" />
        </Field>

        <Field label="About Me *">
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={5} maxLength={2000} className={`${inputCls} resize-none`} placeholder="Tell students about your preparation journey..." />
          <p className="text-xs text-slate-600 mt-1 text-right">{about.length}/2000</p>
        </Field>

        <Field label="Profile Photo URL">
          <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className={inputCls} placeholder="https://..." />
        </Field>

        <Field label="College / Organisation *">
          <input value={college} onChange={(e) => setCollege(e.target.value)} className={inputCls} />
        </Field>

        <Field label="Years of Mentoring Experience">
          <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} min={0} max={40} className={inputCls} />
        </Field>

        <Field label="LinkedIn URL">
          <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputCls} placeholder="https://linkedin.com/in/..." />
        </Field>

        <Field label="Languages *">
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                  languages.includes(lang)
                    ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                )}>
                {lang}
              </button>
            ))}
          </div>
        </Field>

        <button onClick={saveProfile} disabled={savingProfile}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 disabled:opacity-40 transition-colors">
          {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </button>
      </section>

      {/* ── Exam achievements ─────────────────────────────────────────────── */}
      <section className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 space-y-4">
        <h2 className="text-white font-semibold">Exam Achievements</h2>
        <p className="text-xs text-slate-500">
          Add rank cards, scorecards and certificates. Each is reviewed by our admin team
          before the Verified badge appears on your public profile.
        </p>

        {/* Add achievement form */}
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
          <Field label="Title *">
            <input value={achTitle} onChange={(e) => setAchTitle(e.target.value)} placeholder="GATE 2025 Rank Card" className={inputCls} />
          </Field>
          <Field label="Description">
            <input value={achDesc} onChange={(e) => setAchDesc(e.target.value)} placeholder="AIR 142 — GATE CSE 2025" className={inputCls} />
          </Field>
          <Field label="Certificate URL (optional)">
            <input value={achFileUrl} onChange={(e) => setAchFileUrl(e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          <button onClick={addAchievement} disabled={addingAch}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-xl text-sm font-medium hover:bg-violet-600/30 disabled:opacity-40">
            {addingAch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Achievement
          </button>
        </div>

        {/* Existing achievements */}
        {achievements.length > 0 && (
          <div className="space-y-2">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{a.title}</p>
                  {a.description && <p className="text-slate-500 text-xs mt-0.5">{a.description}</p>}
                  {a.fileUrl && (
                    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:underline">
                      View certificate
                    </a>
                  )}
                </div>
                <StatusChip status={a.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    PENDING:  "bg-amber-500/15 text-amber-400 border-amber-500/20",
    VERIFIED: "bg-green-500/15 text-green-400 border-green-500/20",
    REJECTED: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 flex items-center gap-1", cfg[status] ?? cfg.PENDING)}>
      {status === "VERIFIED" && <BadgeCheck className="w-3 h-3" />}
      {status === "PENDING" ? "Pending Review" : status === "VERIFIED" ? "Verified" : "Rejected"}
    </span>
  );
}

const inputCls =
  "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60";
