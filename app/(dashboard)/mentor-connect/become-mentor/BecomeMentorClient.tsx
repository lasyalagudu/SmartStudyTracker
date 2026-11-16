"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Upload, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExamEntry {
  examName: string;
  examYear: number | string;
  rank: string;
  score: string;
  college: string;
  description: string;
}

interface ExistingProfile {
  headline: string;
  about: string;
  photoUrl: string | null;
  primaryExam: string;
  college: string;
  languages: string[];
  experienceYears: number;
  linkedinUrl: string | null;
  status: string;
  exams: ExamEntry[];
}

interface Props {
  userName: string | null;
  existingProfile: ExistingProfile | null;
}

const EXAM_OPTIONS = ["GATE CSE","GATE ECE","JEE","NEET","UPSC","CAT","Placements","Other"];
const LANGUAGE_OPTIONS = ["English","Hindi","Telugu","Tamil","Kannada","Malayalam","Bengali","Marathi","Gujarati"];

export default function BecomeMentorClient({ userName, existingProfile }: Props) {
  const router = useRouter();
  const isEdit = !!existingProfile && existingProfile.status !== "DRAFT";

  const [headline,        setHeadline]        = useState(existingProfile?.headline ?? "");
  const [about,           setAbout]           = useState(existingProfile?.about ?? "");
  const [photoUrl,        setPhotoUrl]        = useState(existingProfile?.photoUrl ?? "");
  const [primaryExam,     setPrimaryExam]     = useState(existingProfile?.primaryExam ?? "");
  const [college,         setCollege]         = useState(existingProfile?.college ?? "");
  const [experienceYears, setExperienceYears] = useState<number>(existingProfile?.experienceYears ?? 0);
  const [linkedinUrl,     setLinkedinUrl]     = useState(existingProfile?.linkedinUrl ?? "");
  const [languages,       setLanguages]       = useState<string[]>(existingProfile?.languages ?? ["English"]);
  const [exams, setExams] = useState<ExamEntry[]>(
  existingProfile?.exams?.length
    ? existingProfile.exams.map((e) => ({
        examName: e.examName,
        examYear: e.examYear,
        rank: e.rank ?? "",
        score: e.score ?? "",
        college: e.college ?? "",
        description: e.description ?? "",
      }))
    : [{
        examName: "",
        examYear: new Date().getFullYear(),
        rank: "",
        score: "",
        college: "",
        description: "",
      }]
);
  const [saving,    setSaving]    = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [langInput, setLangInput] = useState("");

  function addExam() {
    setExams([...exams, { examName: "", examYear: new Date().getFullYear(), rank: "", score: "", college: "", description: "" }]);
  }
  function removeExam(i: number) {
    if (exams.length === 1) return;
    setExams(exams.filter((_, idx) => idx !== i));
  }
  function updateExam(i: number, field: keyof ExamEntry, value: string | number) {
    setExams(exams.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  }

  function toggleLanguage(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  async function handleSave(submit: boolean) {
    if (!headline.trim()) { toast.error("Please add a headline"); return; }
    if (!about.trim())    { toast.error("Please write an about section"); return; }
    if (!primaryExam)     { toast.error("Please select your primary exam"); return; }
    if (!college.trim())  { toast.error("Please enter your college/organisation"); return; }
    if (languages.length === 0) { toast.error("Please select at least one language"); return; }
    if (exams.some((e) => !e.examName || !e.examYear)) {
      toast.error("Please fill in all exam entries"); return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/mentor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: headline.trim(),
          about: about.trim(),
          photoUrl: photoUrl || null,
          primaryExam,
          college: college.trim(),
          languages,
          experienceYears,
          linkedinUrl: linkedinUrl || null,
          exams: exams.map((e) => ({
            examName:    e.examName,
            examYear:    Number(e.examYear),
            rank:        e.rank || null,
            score:       e.score || null,
            college:     e.college || null,
            description: e.description || "",
          })),
          submit,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      if (submit) {
        setSubmitted(true);
        toast.success("Application submitted for review!");
      } else {
        toast.success("Draft saved");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-white text-2xl font-bold mb-3">Application Submitted!</h2>
        <p className="text-slate-400 text-sm mb-6">
          Our team will review your profile and achievements. You&apos;ll be notified once approved.
          This usually takes 1–3 business days.
        </p>
        <Link
          href="/mentor-connect"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold"
        >
          Back to Mentor Connect
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/mentor-connect"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Become a Mentor</h1>
        <p className="text-slate-400 text-sm">
          Share your experience. Help students crack their exams. Earn on your terms.
        </p>
      </div>

      <div className="space-y-6">

        {/* Basic Info */}
        <Card title="Basic Information">
          <Field label="Your Name">
            <input
              value={userName ?? ""}
              disabled
              className="w-full px-3 py-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1">Synced from your account</p>
          </Field>

          <Field label="Professional Headline *" hint="e.g. GATE CSE AIR 142 | IIT Hyderabad">
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={200}
              placeholder="Your one-line intro..."
              className={inputCls}
            />
          </Field>

          <Field label="About Me *" hint="Describe your preparation journey, what you can help with">
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Tell students about yourself, your preparation strategy, and how you can help..."
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-slate-600 mt-1">{about.length}/2000</p>
          </Field>

          <Field label="Profile Photo URL" hint="Paste a public image URL (e.g. LinkedIn photo)">
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </Field>
        </Card>

        {/* Exam Specialisation */}
        <Card title="Exam Specialisation">
          <Field label="Primary Exam *">
            <select
              value={primaryExam}
              onChange={(e) => setPrimaryExam(e.target.value)}
              className={inputCls}
            >
              <option value="" className="bg-[#0A0F1E]">Select exam...</option>
              {EXAM_OPTIONS.map((e) => (
                <option key={e} value={e} className="bg-[#0A0F1E]">{e}</option>
              ))}
            </select>
          </Field>

          <Field label="College / Organisation *">
            <input
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. IIT Bombay"
              className={inputCls}
            />
          </Field>

          <Field label="Years of Mentoring Experience">
            <input
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              min={0} max={40}
              className={inputCls}
            />
          </Field>

          <Field label="LinkedIn Profile URL">
            <input
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className={inputCls}
            />
          </Field>

          <Field label="Languages *">
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                    languages.includes(lang)
                      ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </Field>
        </Card>

        {/* Exam achievements */}
        <Card title="Exam Achievements">
          <p className="text-xs text-slate-500 mb-4">
            Add your rank card / scorecard URL in your achievements after profile creation. Here just enter the exam details.
          </p>
          {exams.map((exam, i) => (
            <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-3 relative">
              {exams.length > 1 && (
                <button
                  onClick={() => removeExam(i)}
                  className="absolute top-3 right-3 text-slate-600 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Exam *">
                  <select value={exam.examName} onChange={(e) => updateExam(i, "examName", e.target.value)} className={inputCls}>
                    <option value="" className="bg-[#0A0F1E]">Select...</option>
                    {EXAM_OPTIONS.map((e) => <option key={e} value={e} className="bg-[#0A0F1E]">{e}</option>)}
                  </select>
                </Field>
                <Field label="Year *">
                  <input type="number" value={exam.examYear} onChange={(e) => updateExam(i, "examYear", e.target.value)}
                    min={1990} max={2030} className={inputCls} />
                </Field>
                <Field label="Rank / AIR">
                  <input value={exam.rank} onChange={(e) => updateExam(i, "rank", e.target.value)}
                    placeholder="e.g. 142" className={inputCls} />
                </Field>
                <Field label="Score / Marks">
                  <input value={exam.score} onChange={(e) => updateExam(i, "score", e.target.value)}
                    placeholder="e.g. 78.5 marks" className={inputCls} />
                </Field>
                <div className="col-span-2">
                  <Field label="College (for this exam)">
                    <input value={exam.college} onChange={(e) => updateExam(i, "college", e.target.value)}
                      placeholder="IIT Bombay" className={inputCls} />
                  </Field>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addExam}
            className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 mt-1"
          >
            <Plus className="w-4 h-4" /> Add Another Exam
          </button>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex-1 py-3 border border-white/15 text-slate-300 rounded-xl text-sm font-medium hover:bg-white/5 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-violet-400 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Submit for Review
          </button>
        </div>

        <p className="text-center text-xs text-slate-600">
          After approval, you can set your session prices and availability from the Mentor Dashboard.
        </p>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
      <h2 className="text-white font-semibold text-sm mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 font-medium mb-1.5">
        {label}
        {hint && <span className="text-slate-600 font-normal"> — {hint}</span>}
      </label>
      {children}
    </div>
  );
}
