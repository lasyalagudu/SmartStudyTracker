"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Check,
  Plus,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Zap,
  Search,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types (mirroring API shapes) ────────────────────────────────────────────

interface CatalogExam {
  id: string;
  slug: string;
  label: string;
  description: string;
  icon: string;
  totalHours: number;
  subjectCount: number;
  topicCount: number;
}

interface CatalogTopic {
  id: string;
  name: string;
  estimatedHours: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  order: number;
}

interface CatalogSubject {
  id: string;
  name: string;
  color: string;
  order: number;
  topics: CatalogTopic[];
}

// DraftSubject — what we send to /api/onboarding when saving an AI-generated draft
interface DraftSubject {
  name: string;
  color: string;
  topics: { name: string; estimatedHours: number; priority: string; difficulty: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS = ["Welcome", "Exam Setup", "Confirm"];

const SUBJECT_COLORS = [
  "#7C3AED", "#2563EB", "#059669", "#D97706",
  "#DC2626", "#0891B2", "#DB2777", "#4F46E5",
];

const PRIORITY_STYLES: Record<string, string> = {
  HIGH:   "bg-rose-500/15 text-rose-400 border-rose-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  LOW:    "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  // ── Step state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Catalog state ───────────────────────────────────────────────────────
  const [catalogExams, setCatalogExams]     = useState<CatalogExam[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [examSearch, setExamSearch]         = useState("");

  // ── Selection state ─────────────────────────────────────────────────────
  const [selectedExam, setSelectedExam]   = useState<CatalogExam | null>(null);
  // For custom exam name when no catalog match
  const [customExamName, setCustomExamName] = useState("");
  const [targetDate, setTargetDate]       = useState("");

  // ── Syllabus mode ────────────────────────────────────────────────────────
  // "catalog"     — verified template from DB
  // "draft"       — AI-generated, student reviews before saving
  // "manual"      — user types subjects manually
  type SyllabusMode = "catalog" | "draft" | "manual";
  const [syllabusMode, setSyllabusMode] = useState<SyllabusMode>("catalog");

  // ── Catalog preview (loaded on step 3 for catalog mode) ─────────────────
  const [catalogPreview, setCatalogPreview]         = useState<CatalogSubject[]>([]);
  const [catalogPreviewLoading, setCatalogPreviewLoading] = useState(false);
  const [expandedSubject, setExpandedSubject]       = useState<string | null>(null);

  // ── AI draft state ───────────────────────────────────────────────────────
  const [draftSubjects, setDraftSubjects]   = useState<DraftSubject[]>([]);
  const [draftGenerating, setDraftGenerating] = useState(false);
  const [draftSource, setDraftSource]       = useState<"ai" | "placeholder" | null>(null);
  // Editing a draft topic inline
  const [editingTopic, setEditingTopic] = useState<{ subjectIdx: number; topicIdx: number } | null>(null);
  const [editingTopicName, setEditingTopicName] = useState("");

  // ── Manual subjects ──────────────────────────────────────────────────────
  const [manualSubjects, setManualSubjects]   = useState<string[]>([]);
  const [manualSubjectInput, setManualSubjectInput] = useState("");

  // ── Launch state ─────────────────────────────────────────────────────────
  const [launching, setLaunching] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────
  const examName  = selectedExam?.label ?? customExamName;
  const catalogSlug = selectedExam?.slug;
  const daysLeft  = targetDate
    ? Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86_400_000)
    : null;

  const filteredExams = catalogExams.filter((e) =>
    e.label.toLowerCase().includes(examSearch.toLowerCase()) ||
    e.description.toLowerCase().includes(examSearch.toLowerCase())
  );

  // Whether the typed exam name matches a catalog entry (case-insensitive)
  const customMatchesCatalog =
    !selectedExam &&
    customExamName.trim().length > 0 &&
    catalogExams.some((e) =>
      e.label.toLowerCase() === customExamName.trim().toLowerCase()
    );

  // ── Load catalog on mount ────────────────────────────────────────────────
  useEffect(() => {
    setCatalogLoading(true);
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => setCatalogExams(data.exams ?? []))
      .catch(() => toast.error("Could not load exam catalog"))
      .finally(() => setCatalogLoading(false));
  }, []);

  // ── Load catalog preview when entering step 3 in catalog mode ───────────
  useEffect(() => {
    if (step === 3 && syllabusMode === "catalog" && catalogSlug && catalogPreview.length === 0) {
      setCatalogPreviewLoading(true);
      fetch(`/api/catalog/${catalogSlug}`)
        .then((r) => r.json())
        .then((data) => setCatalogPreview(data.catalog?.subjects ?? []))
        .catch(() => toast.error("Could not load syllabus preview"))
        .finally(() => setCatalogPreviewLoading(false));
    }
  }, [step, syllabusMode, catalogSlug, catalogPreview.length]);

  // ── Exam selection ────────────────────────────────────────────────────────
  function handleSelectCatalogExam(exam: CatalogExam) {
    setSelectedExam(exam);
    setCustomExamName("");
    setSyllabusMode("catalog");
    setCatalogPreview([]);
    setDraftSubjects([]);
    setExpandedSubject(null);
  }

  function handleCustomExamChange(value: string) {
    setCustomExamName(value);
    setSelectedExam(null);
    setCatalogPreview([]);
    setDraftSubjects([]);
    // Default to manual for custom exams; switch to draft when generated
    setSyllabusMode("manual");
  }

  // ── AI draft generation ───────────────────────────────────────────────────
  const generateDraft = useCallback(async () => {
    const name = examName.trim();
    if (!name) return;

    setDraftGenerating(true);
    setDraftSubjects([]);
    setDraftSource(null);

    try {
      const res  = await fetch("/api/catalog/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ examName: name }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Generation failed");

      // If the server found a catalog match, switch to catalog mode
      if (data.source === "catalog" && data.catalogSlug) {
        const match = catalogExams.find((e) => e.slug === data.catalogSlug);
        if (match) {
          handleSelectCatalogExam(match);
          toast.info(`Found a verified syllabus for "${match.label}" — switching to it.`);
          return;
        }
      }

      setDraftSubjects(data.subjects ?? []);
      setDraftSource(data.source);
      setSyllabusMode("draft");

      if (data.source === "ai") {
        toast.success("AI draft generated — review and edit before saving.");
      } else {
        toast.info("No AI key configured — showing a starter template. Edit it to match your syllabus.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setDraftGenerating(false);
    }
  }, [examName, catalogExams]);

  // ── Draft editing helpers ─────────────────────────────────────────────────
  function removeDraftTopic(si: number, ti: number) {
    setDraftSubjects((prev) =>
      prev.map((s, i) =>
        i !== si ? s : { ...s, topics: s.topics.filter((_, j) => j !== ti) }
      ).filter((s) => s.topics.length > 0)
    );
  }

  function startEditTopic(si: number, ti: number, name: string) {
    setEditingTopic({ subjectIdx: si, topicIdx: ti });
    setEditingTopicName(name);
  }

  function commitEditTopic() {
    if (!editingTopic || !editingTopicName.trim()) {
      setEditingTopic(null);
      return;
    }
    const { subjectIdx: si, topicIdx: ti } = editingTopic;
    setDraftSubjects((prev) =>
      prev.map((s, i) =>
        i !== si
          ? s
          : {
              ...s,
              topics: s.topics.map((t, j) =>
                j !== ti ? t : { ...t, name: editingTopicName.trim() }
              ),
            }
      )
    );
    setEditingTopic(null);
  }

  function removeDraftSubject(si: number) {
    setDraftSubjects((prev) => prev.filter((_, i) => i !== si));
  }

  // ── Manual subjects ───────────────────────────────────────────────────────
  function addManualSubject() {
    const trimmed = manualSubjectInput.trim();
    if (!trimmed || manualSubjects.includes(trimmed)) return;
    setManualSubjects((prev) => [...prev, trimmed]);
    setManualSubjectInput("");
  }

  function removeManualSubject(s: string) {
    setManualSubjects((prev) => prev.filter((x) => x !== s));
  }

  // ── Step 2 → 3 validation ─────────────────────────────────────────────────
  function canProceedToConfirm(): boolean {
    if (!examName.trim()) return false;
    if (syllabusMode === "manual" && manualSubjects.length === 0) return false;
    if (syllabusMode === "draft"  && draftSubjects.length === 0)  return false;
    return true;
  }

  // ── Launch ────────────────────────────────────────────────────────────────
  async function handleLaunch() {
    if (!examName.trim()) { toast.error("Please select or enter an exam"); return; }

    setLaunching(true);
    try {
      let body: Record<string, unknown>;

      if (syllabusMode === "catalog") {
        body = { examName, targetDate, useTemplate: true, catalogSlug };
      } else if (syllabusMode === "draft") {
        body = { examName, targetDate, draftSubjects };
      } else {
        body = { examName, targetDate, subjects: manualSubjects };
      }

      const res  = await fetch("/api/onboarding", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");

      if (data.stats) {
        toast.success(
          `Syllabus ready! ${data.stats.subjects} subjects · ${data.stats.topics} topics · ~${data.stats.totalHours}h`
        );
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLaunching(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-xl text-white">Smart Study Tracker</div>
          <div className="text-xs text-violet-400">Plan. Focus. Track. Achieve.</div>
        </div>
      </div>

      {/* Step progress */}
      <div className="relative z-10 flex items-center gap-0 mb-10 w-full max-w-2xl">
        {STEP_LABELS.map((label, index) => {
          const num      = index + 1;
          const isActive = step === num;
          const isDone   = step > num;
          return (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div className={cn("flex-1 h-px", isDone ? "bg-violet-500" : "bg-white/10")} />
                )}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2",
                  isActive && "bg-violet-600 border-violet-400 text-white",
                  isDone   && "bg-violet-600 border-violet-500 text-white",
                  !isActive && !isDone && "bg-white/5 border-white/20 text-slate-400"
                )}>
                  {isDone ? <Check className="w-4 h-4" /> : num}
                </div>
                {index < 2 && (
                  <div className={cn("flex-1 h-px", step > num ? "bg-violet-500" : "bg-white/10")} />
                )}
              </div>
              <span className={cn("text-xs mt-2 text-center", isActive ? "text-violet-300" : "text-slate-500")}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Three-column card layout */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">

        {/* ── Card 1: Welcome ───────────────────────────────────────────── */}
        <div className={cn(
          "bg-[#0A0F1E] border rounded-2xl p-6",
          step === 1 ? "border-violet-500/40" : "border-white/10 opacity-50"
        )}>
          <div className="flex flex-col items-center text-center h-full">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Rocket className="w-10 h-10 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Welcome to<br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Smart Study Tracker
              </span>
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Your companion for focused and consistent exam preparation.
            </p>
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-semibold"
              >
                Continue
              </button>
            )}
          </div>
        </div>

        {/* ── Card 2: Exam Setup ────────────────────────────────────────── */}
        <div className={cn(
          "bg-[#0A0F1E] border rounded-2xl p-6 flex flex-col",
          step === 2 ? "border-violet-500/40" : "border-white/10 opacity-50"
        )}>
          <h2 className="text-lg font-bold text-white mb-1">Set up your exam</h2>
          <p className="text-xs text-slate-400 mb-4">Pick from the catalog or enter any exam name.</p>

          {/* Search / custom name input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={selectedExam ? selectedExam.label : examSearch || customExamName}
              onChange={(e) => {
                const v = e.target.value;
                // Clear selection when user types
                if (selectedExam) {
                  setSelectedExam(null);
                  setCatalogPreview([]);
                }
                setExamSearch(v);
                handleCustomExamChange(v);
              }}
              onFocus={() => { if (selectedExam) { setExamSearch(selectedExam.label); setSelectedExam(null); }}}
              placeholder="Search or type any exam…"
              disabled={step !== 2}
              className="w-full pl-8 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
            />
          </div>

          {/* Catalog grid */}
          <div className="flex-1 overflow-y-auto min-h-0 mb-3"
               style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            {catalogLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
              </div>
            ) : filteredExams.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredExams.map((exam) => (
                  <button
                    key={exam.slug}
                    onClick={() => step === 2 && handleSelectCatalogExam(exam)}
                    disabled={step !== 2}
                    className={cn(
                      "flex flex-col items-start gap-1 p-2.5 rounded-xl border text-left transition-all",
                      selectedExam?.slug === exam.slug
                        ? "border-violet-500 bg-violet-500/15"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <span className="text-base">{exam.icon}</span>
                      <span className={cn(
                        "text-xs font-semibold truncate",
                        selectedExam?.slug === exam.slug ? "text-violet-300" : "text-white"
                      )}>
                        {exam.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{exam.subjectCount} subj</span>
                      <span>·</span>
                      <span>~{exam.totalHours}h</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : examSearch || customExamName ? (
              /* No catalog match — show custom exam option */
              <div className="border border-dashed border-white/15 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 mb-2">
                  No catalog entry for <span className="text-white font-medium">&ldquo;{examSearch || customExamName}&rdquo;</span>
                </p>
                <p className="text-[10px] text-slate-600">
                  You can add it manually or generate a draft syllabus with AI.
                </p>
              </div>
            ) : null}
          </div>

          {/* Exam date */}
          <div className="mb-3">
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Exam Date (optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              disabled={step !== 2}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/60"
            />
          </div>

          {/* Syllabus mode — only shown when an exam is selected/typed */}
          {step === 2 && examName.trim() && (
            <div className="mb-3">
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Syllabus Setup</label>
              <div className="space-y-1.5">

                {/* Catalog option — only when catalog exam selected */}
                {selectedExam && (
                  <ModeRadio
                    selected={syllabusMode === "catalog"}
                    onSelect={() => setSyllabusMode("catalog")}
                    icon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />}
                    label="Use verified syllabus"
                    badge="Recommended"
                    description={`${selectedExam.subjectCount} subjects · ${selectedExam.topicCount} topics · ~${selectedExam.totalHours}h`}
                  />
                )}

                {/* AI draft option */}
                <ModeRadio
                  selected={syllabusMode === "draft"}
                  onSelect={() => {
                    setSyllabusMode("draft");
                    if (draftSubjects.length === 0) generateDraft();
                  }}
                  icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
                  label="Generate draft syllabus"
                  badge={!selectedExam ? "For unlisted exams" : undefined}
                  description={
                    draftGenerating
                      ? "Generating…"
                      : draftSubjects.length > 0
                        ? `${draftSubjects.length} subjects generated — review before saving`
                        : "AI builds a starter syllabus you can review and edit"
                  }
                  loading={draftGenerating && syllabusMode === "draft"}
                />

                {/* Manual option */}
                <ModeRadio
                  selected={syllabusMode === "manual"}
                  onSelect={() => setSyllabusMode("manual")}
                  icon={<Plus className="w-3.5 h-3.5 text-slate-400" />}
                  label="Add subjects manually"
                  description="Enter subject names now, add topics later"
                />
              </div>
            </div>
          )}

          {/* Manual subject input */}
          {step === 2 && syllabusMode === "manual" && (
            <div className="mb-3">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={manualSubjectInput}
                  onChange={(e) => setManualSubjectInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addManualSubject())}
                  placeholder="Subject name…"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                />
                <button onClick={addManualSubject} className="px-3 py-2 bg-violet-600 rounded-xl text-white">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {manualSubjects.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-1 bg-violet-600/20 text-violet-300 rounded-lg text-xs border border-violet-500/30">
                    {s}
                    <button onClick={() => removeManualSubject(s)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-white/15 text-slate-300 rounded-xl text-sm"
              >
                Back
              </button>
              <button
                onClick={() => canProceedToConfirm() && setStep(3)}
                disabled={!canProceedToConfirm()}
                className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* ── Card 3: Confirm ───────────────────────────────────────────── */}
        <div className={cn(
          "bg-[#0A0F1E] border rounded-2xl p-6 flex flex-col",
          step === 3 ? "border-violet-500/40" : "border-white/10 opacity-50"
        )}>
          <div className="flex flex-col items-center text-center mb-4">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-white">Review & Launch</h2>
            <p className="text-xs text-slate-400 mt-1">Confirm your setup, then launch.</p>
          </div>

          {/* Summary rows */}
          <div className="space-y-3 mb-4">
            <SummaryRow label="Exam"           value={examName || "—"} />
            <SummaryRow label="Exam Date"      value={targetDate || "—"} />
            <SummaryRow label="Days Remaining" value={daysLeft !== null ? `${daysLeft} days` : "—"} />
          </div>

          {/* Syllabus preview */}
          {step === 3 && syllabusMode === "catalog" && (
            catalogPreviewLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
              </div>
            ) : (
              <SyllabusPreview
                subjects={catalogPreview}
                expandedSubject={expandedSubject}
                onToggle={(n) => setExpandedSubject((p) => (p === n ? null : n))}
                totalHours={selectedExam?.totalHours ?? 0}
                readonly
              />
            )
          )}

          {step === 3 && syllabusMode === "draft" && (
            <div className="flex-1 min-h-0">
              {/* Draft warning banner */}
              {draftSource && (
                <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-3">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-amber-300 leading-relaxed">
                    {draftSource === "ai"
                      ? "AI-generated draft — verify topics against the official syllabus before saving."
                      : "Starter template — edit topics to match your actual syllabus."}
                  </p>
                </div>
              )}
              <DraftEditor
                subjects={draftSubjects}
                editingTopic={editingTopic}
                editingTopicName={editingTopicName}
                onEditStart={startEditTopic}
                onEditChange={setEditingTopicName}
                onEditCommit={commitEditTopic}
                onRemoveTopic={removeDraftTopic}
                onRemoveSubject={removeDraftSubject}
                expandedSubject={expandedSubject}
                onToggle={(n) => setExpandedSubject((p) => (p === n ? null : n))}
              />
              {/* Regenerate link */}
              <button
                onClick={generateDraft}
                disabled={draftGenerating}
                className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 disabled:opacity-40"
              >
                <RefreshCw className={cn("w-3 h-3", draftGenerating && "animate-spin")} />
                Regenerate draft
              </button>
            </div>
          )}

          {step === 3 && syllabusMode === "manual" && (
            <SummaryRow
              label={`Subjects (${manualSubjects.length})`}
              value={manualSubjects.join(", ") || "—"}
            />
          )}

          {/* Launch / back */}
          {step === 3 && (
            <div className="mt-auto pt-4">
              <button
                onClick={handleLaunch}
                disabled={launching}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {launching ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />
                    {syllabusMode === "catalog" ? "Building syllabus…" : "Setting up…"}
                  </>
                ) : (
                  <>{syllabusMode === "catalog" ? <Zap className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    {syllabusMode === "catalog" ? "Auto-populate & Launch" : "Go to Dashboard"}
                  </>
                )}
              </button>
              <button
                onClick={() => setStep(2)}
                className="w-full mt-2 py-2 text-xs text-slate-500 hover:text-slate-300"
              >
                Edit Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-white/5">
      <span className="text-sm text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-semibold text-white text-right">{value}</span>
    </div>
  );
}

function ModeRadio({
  selected, onSelect, icon, label, badge, description, loading,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  description?: string;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all",
        selected ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-white/5 hover:border-white/20"
      )}
    >
      <div className={cn(
        "w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center",
        selected ? "border-violet-400 bg-violet-500" : "border-white/30"
      )}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {icon}
          <span className="text-xs font-semibold text-white">{label}</span>
          {badge && (
            <span className="text-[9px] px-1.5 py-0.5 bg-violet-600/30 text-violet-300 rounded-full font-medium">
              {badge}
            </span>
          )}
          {loading && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
        </div>
        {description && <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>}
      </div>
    </button>
  );
}

const PRIORITY_STYLES_LOCAL: Record<string, string> = {
  HIGH:   "bg-rose-500/15 text-rose-400 border-rose-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  LOW:    "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

function SyllabusPreview({
  subjects, expandedSubject, onToggle, totalHours, readonly,
}: {
  subjects: CatalogSubject[];
  expandedSubject: string | null;
  onToggle: (name: string) => void;
  totalHours: number;
  readonly?: boolean;
}) {
  if (subjects.length === 0) return null;
  const topicCount = subjects.reduce((n, s) => n + s.topics.length, 0);

  return (
    <div className="flex-1 min-h-0">
      <div className="flex items-center gap-3 mb-2 p-2.5 bg-violet-600/10 rounded-xl border border-violet-500/20">
        <Sparkles className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
        <div className="flex gap-3 text-xs">
          <span className="text-violet-300 font-semibold">{subjects.length} subjects</span>
          <span className="text-slate-500">·</span>
          <span className="text-violet-300 font-semibold">{topicCount} topics</span>
          <span className="text-slate-500">·</span>
          <span className="text-violet-300 font-semibold">~{totalHours}h</span>
        </div>
      </div>
      <div
        className="overflow-y-auto max-h-[200px] space-y-1 pr-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {subjects.map((subject) => {
          const isExpanded  = expandedSubject === subject.name;
          const subjectHours = subject.topics.reduce((n, t) => n + t.estimatedHours, 0);
          const highCount   = subject.topics.filter((t) => t.priority === "HIGH").length;
          return (
            <div key={subject.name} className="rounded-xl overflow-hidden border border-white/5">
              <button
                onClick={() => onToggle(subject.name)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-white/[0.03] hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                <span className="flex-1 text-xs font-medium text-white truncate">{subject.name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />{subjectHours}h
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <BookOpen className="w-3 h-3" />{subject.topics.length}
                  </span>
                  {highCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full">
                      {highCount} high
                    </span>
                  )}
                  {isExpanded
                    ? <ChevronDown className="w-3 h-3 text-slate-500" />
                    : <ChevronRight className="w-3 h-3 text-slate-500" />
                  }
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 py-2 space-y-1 bg-black/20">
                  {subject.topics.map((topic) => (
                    <div key={topic.id ?? topic.name} className="flex items-center justify-between gap-2 py-0.5">
                      <span className="text-[11px] text-slate-400 truncate flex-1">{topic.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-slate-600">{topic.estimatedHours}h</span>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full border font-medium",
                          PRIORITY_STYLES_LOCAL[topic.priority]
                        )}>
                          {topic.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DraftEditor({
  subjects, editingTopic, editingTopicName,
  onEditStart, onEditChange, onEditCommit,
  onRemoveTopic, onRemoveSubject,
  expandedSubject, onToggle,
}: {
  subjects: DraftSubject[];
  editingTopic: { subjectIdx: number; topicIdx: number } | null;
  editingTopicName: string;
  onEditStart: (si: number, ti: number, name: string) => void;
  onEditChange: (v: string) => void;
  onEditCommit: () => void;
  onRemoveTopic: (si: number, ti: number) => void;
  onRemoveSubject: (si: number) => void;
  expandedSubject: string | null;
  onToggle: (name: string) => void;
}) {
  if (subjects.length === 0) return (
    <p className="text-xs text-slate-500 text-center py-4">No draft yet — generate one first.</p>
  );

  const totalTopics = subjects.reduce((n, s) => n + s.topics.length, 0);
  const totalHours  = subjects.reduce((n, s) => n + s.topics.reduce((t, tp) => t + tp.estimatedHours, 0), 0);

  return (
    <div className="flex-1 min-h-0">
      <div className="flex items-center gap-2 mb-2 text-[10px] text-slate-500">
        <span className="text-violet-300 font-semibold">{subjects.length} subjects</span>
        <span>·</span>
        <span className="text-violet-300 font-semibold">{totalTopics} topics</span>
        <span>·</span>
        <span className="text-violet-300 font-semibold">~{totalHours}h</span>
        <span className="ml-auto text-slate-600">(click to edit)</span>
      </div>
      <div
        className="overflow-y-auto max-h-[200px] space-y-1 pr-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {subjects.map((subject, si) => {
          const isExpanded = expandedSubject === subject.name;
          return (
            <div key={subject.name + si} className="rounded-xl overflow-hidden border border-white/5">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03]">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: SUBJECT_COLORS[si % SUBJECT_COLORS.length] }}
                />
                <button
                  onClick={() => onToggle(subject.name)}
                  className="flex-1 text-xs font-medium text-white text-left truncate"
                >
                  {subject.name}
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[10px] text-slate-600">{subject.topics.length}</span>
                  <button
                    onClick={() => onRemoveSubject(si)}
                    className="p-0.5 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => onToggle(subject.name)}>
                    {isExpanded
                      ? <ChevronDown className="w-3 h-3 text-slate-500" />
                      : <ChevronRight className="w-3 h-3 text-slate-500" />
                    }
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="px-3 py-2 space-y-1 bg-black/20">
                  {subject.topics.map((topic, ti) => {
                    const isEditing =
                      editingTopic?.subjectIdx === si && editingTopic?.topicIdx === ti;
                    return (
                      <div key={topic.name + ti} className="flex items-center gap-2 py-0.5 group">
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editingTopicName}
                            onChange={(e) => onEditChange(e.target.value)}
                            onBlur={onEditCommit}
                            onKeyDown={(e) => e.key === "Enter" && onEditCommit()}
                            className="flex-1 text-[11px] bg-white/10 border border-violet-500/40 rounded px-1.5 py-0.5 text-white outline-none"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-400 truncate flex-1">{topic.name}</span>
                        )}
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditStart(si, ti, topic.name)}
                            className="p-0.5 text-slate-600 hover:text-violet-400"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onRemoveTopic(si, ti)}
                            className="p-0.5 text-slate-600 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-600 flex-shrink-0">{topic.estimatedHours}h</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
