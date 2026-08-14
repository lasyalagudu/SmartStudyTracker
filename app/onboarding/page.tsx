"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Check,
  Plus,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { EXAM_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Welcome", "Exam Setup", "Confirm"];

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedExam, setSelectedExam] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [loading, setLoading] = useState(false);

  function addSubject() {
    const trimmed = subjectInput.trim();
    if (!trimmed || subjects.includes(trimmed)) return;
    setSubjects([...subjects, trimmed]);
    setSubjectInput("");
  }

  function removeSubject(subject: string) {
    setSubjects(subjects.filter((s) => s !== subject));
  }

  async function handleLaunch() {
    if (!selectedExam) {
      toast.error("Please select an exam");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examName: selectedExam,
          targetDate,
          subjects,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Setup failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  }

  const daysLeft = targetDate
    ? Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />

      <div className="relative z-10 flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-xl text-white">
            Smart Study Tracker
          </div>
          <div className="text-xs text-violet-400">
            Plan. Focus. Track. Achieve.
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-0 mb-10 w-full max-w-2xl">
        {STEP_LABELS.map((label, index) => {
          const num = index + 1;
          const isActive = step === num;
          const isDone = step > num;

          return (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={cn(
                      "flex-1 h-px",
                      isDone ? "bg-violet-500" : "bg-white/10"
                    )}
                  />
                )}

                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2",
                    isActive &&
                      "bg-violet-600 border-violet-400 text-white",
                    isDone && "bg-violet-600 border-violet-500 text-white",
                    !isActive &&
                      !isDone &&
                      "bg-white/5 border-white/20 text-slate-400"
                  )}
                >
                  {isDone ? <Check className="w-4 h-4" /> : num}
                </div>

                {index < 2 && (
                  <div
                    className={cn(
                      "flex-1 h-px",
                      step > num ? "bg-violet-500" : "bg-white/10"
                    )}
                  />
                )}
              </div>

              <span
                className={cn(
                  "text-xs mt-2 text-center",
                  isActive ? "text-violet-300" : "text-slate-500"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div
          className={cn(
            "bg-[#0A0F1E] border rounded-2xl p-6",
            step === 1
              ? "border-violet-500/40"
              : "border-white/10 opacity-50"
          )}
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Rocket className="w-10 h-10 text-violet-400" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Welcome to
              <br />
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

        <div
          className={cn(
            "bg-[#0A0F1E] border rounded-2xl p-6",
            step === 2
              ? "border-violet-500/40"
              : "border-white/10 opacity-50"
          )}
        >
          <h2 className="text-lg font-bold text-white mb-1">
            Let&apos;s set up your exam
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            This helps us personalize your dashboard.
          </p>

          <div className="mb-4">
            <label className="text-sm text-slate-300 font-medium mb-2 block">
              Select Your Exam
            </label>

            <div className="grid grid-cols-3 gap-2">
              {EXAM_OPTIONS.slice(0, 6).map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => step === 2 && setSelectedExam(exam.id)}
                  disabled={step !== 2}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium",
                    selectedExam === exam.id
                      ? "border-violet-500 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/5 text-slate-400"
                  )}
                >
                  <span className="text-xl">{exam.icon}</span>
                  {exam.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-slate-300 font-medium mb-2 block">
              Exam Date
            </label>

            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              disabled={step !== 2}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-slate-300 font-medium mb-2 block">
              Subjects
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSubject())
                }
                placeholder="Add a subject"
                disabled={step !== 2}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              />

              <button
                onClick={addSubject}
                disabled={step !== 2}
                className="px-3 py-2 bg-violet-600 rounded-xl text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <span
                  key={subject}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-violet-600/20 text-violet-300 rounded-lg text-xs border border-violet-500/30"
                >
                  {subject}
                  <button onClick={() => removeSubject(subject)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {step === 2 && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-white/15 text-slate-300 rounded-xl text-sm"
              >
                Back
              </button>

              <button
                onClick={() => selectedExam && setStep(3)}
                disabled={!selectedExam}
                className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div
          className={cn(
            "bg-[#0A0F1E] border rounded-2xl p-6",
            step === 3
              ? "border-violet-500/40"
              : "border-white/10 opacity-50"
          )}
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-white">You&apos;re All Set!</h2>
            <p className="text-xs text-slate-400 mt-1">
              Review your details and launch your dashboard.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <Summary label="Exam" value={selectedExam || "—"} />
            <Summary label="Exam Date" value={targetDate || "—"} />
            <Summary
              label="Days Remaining"
              value={daysLeft !== null ? `${daysLeft} days` : "—"}
            />
            <Summary
              label={`Subjects (${subjects.length})`}
              value={subjects.join(", ") || "—"}
            />
          </div>

          {step === 3 && (
            <>
              <button
                onClick={handleLaunch}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Go to Dashboard
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-2 py-2 text-xs text-slate-500 hover:text-slate-300"
              >
                Edit Setup
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-white/5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-white text-right">
        {value}
      </span>
    </div>
  );
}