"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  CheckCircle,
  Timer,
  Flame,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const POMODORO_MODES = [
  {
    id: "POMODORO_FOCUS",
    label: "Focus",
    duration: 25,
    icon: Brain,
    color: "#7C3AED",
  },
  {
    id: "POMODORO_SHORT_BREAK",
    label: "Short Break",
    duration: 5,
    icon: Coffee,
    color: "#059669",
  },
  {
    id: "POMODORO_LONG_BREAK",
    label: "Long Break",
    duration: 15,
    icon: Coffee,
    color: "#2563EB",
  },
] as const;

const FOCUS_DURATIONS = [
  { label: "45 min", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "90 min", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "3 hours", value: 180 },
  { label: "4 hours", value: 240 },
];

type Tab = "POMODORO" | "FOCUS_SESSION" | "CUSTOM";
type PomodoroMode = (typeof POMODORO_MODES)[number];

export default function TimerClient({ subjects }: { subjects: any[] }) {
  const [tab, setTab] = useState<Tab>("POMODORO");
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>(
    POMODORO_MODES[0],
  );
  const [focusMinutes, setFocusMinutes] = useState(60);
  const [customMinutes, setCustomMinutes] = useState(90);

  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  const currentColor =
    tab === "POMODORO"
      ? pomodoroMode.color
      : tab === "FOCUS_SESSION"
        ? "#7C3AED"
        : "#0891B2";

  const currentLabel =
    tab === "POMODORO"
      ? pomodoroMode.label
      : tab === "FOCUS_SESSION"
        ? "Focus Session"
        : "Custom Session";

  const currentDurationMinutes = Math.round(totalSeconds / 60);

  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  const hours = Math.floor(secondsLeft / 3600);
  const mins = Math.floor((secondsLeft % 3600) / 60);
  const secs = secondsLeft % 60;

  const timeText =
    hours > 0
      ? `${hours.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`;

  function stopTimer() {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function setDuration(minutes: number) {
    stopTimer();
    setTotalSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
  }

  function switchTab(nextTab: Tab) {
    setTab(nextTab);

    if (nextTab === "POMODORO") {
      setDuration(pomodoroMode.duration);
    }

    if (nextTab === "FOCUS_SESSION") {
      setDuration(focusMinutes);
    }

    if (nextTab === "CUSTOM") {
      setDuration(customMinutes);
    }
  }

  function switchPomodoroMode(mode: PomodoroMode) {
    setPomodoroMode(mode);
    setDuration(mode.duration);
  }

  function chooseFocusDuration(minutes: number) {
    setFocusMinutes(minutes);
    setDuration(minutes);
  }

  function applyCustomDuration(minutes: number) {
    const safeMinutes = Math.min(Math.max(minutes, 5), 720);
    setCustomMinutes(safeMinutes);
    setDuration(safeMinutes);
  }

  const handleComplete = useCallback(async () => {
    stopTimer();
    setCompleted((count) => count + 1);

    const isStudySession =
      tab === "FOCUS_SESSION" ||
      tab === "CUSTOM" ||
      (tab === "POMODORO" && pomodoroMode.id === "POMODORO_FOCUS");

    if (isStudySession) {
      setTodayMinutes((prev) => prev + currentDurationMinutes);
    }

    toast.success(
      isStudySession
        ? "🎉 Study session complete! Great work!"
        : "⏰ Break complete!",
    );

    if (isStudySession && sessionStartRef.current) {
      await fetch("/api/timer/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: selectedSubjectId || null,
          durationMinutes: currentDurationMinutes,
          sessionType: "FOCUS",
          completed: true,
          startedAt: sessionStartRef.current.toISOString(),
          endedAt: new Date().toISOString(),
        }),
      });
    }
  }, [tab, pomodoroMode.id, selectedSubjectId, currentDurationMinutes]);

  useEffect(() => {
    if (!running) return;

    if (!sessionStartRef.current) {
      sessionStartRef.current = new Date();
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          handleComplete();
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, handleComplete]);

  function toggleTimer() {
    if (!running) {
      sessionStartRef.current = new Date();
    }

    setRunning((value) => !value);
  }

  function reset() {
    stopTimer();
    sessionStartRef.current = null;
    setSecondsLeft(totalSeconds);
  }

  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference * (1 - progress / 100);
  const dailyGoalMinutes = 360;
  const todayProgress = Math.min(
    100,
    Math.round((todayMinutes / dailyGoalMinutes) * 100),
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Study Timer</h1>
        <p className="text-slate-400 text-sm mt-1">
          Choose Pomodoro, long focus sessions, or your own custom duration.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5 bg-[#0A0F1E] border border-white/8 rounded-2xl p-1.5">
        {[
          { id: "POMODORO", label: "Pomodoro", icon: Timer },
          { id: "FOCUS_SESSION", label: "Focus Session", icon: Flame },
          { id: "CUSTOM", label: "Custom", icon: SlidersHorizontal },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => switchTab(item.id as Tab)}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-violet-600/25 border border-violet-500/50 text-violet-300"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "POMODORO" && (
        <div className="grid grid-cols-3 gap-2 mb-8">
          {POMODORO_MODES.map((mode) => {
            const Icon = mode.icon;
            const active = pomodoroMode.id === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => switchPomodoroMode(mode)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm transition-all",
                  active
                    ? "text-white"
                    : "border-white/10 text-slate-500 hover:text-slate-300",
                )}
                style={
                  active
                    ? {
                        background: `${mode.color}22`,
                        borderColor: `${mode.color}60`,
                        color: mode.color,
                      }
                    : {}
                }
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>
      )}

      {tab === "FOCUS_SESSION" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
          {FOCUS_DURATIONS.map((duration) => (
            <button
              key={duration.value}
              onClick={() => chooseFocusDuration(duration.value)}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                focusMinutes === duration.value
                  ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                  : "border-white/10 text-slate-500 hover:text-slate-300",
              )}
            >
              {duration.label}
            </button>
          ))}
        </div>
      )}

      {tab === "CUSTOM" && (
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 mb-8">
          <label className="text-sm text-slate-300 font-medium mb-3 block">
            Custom duration in minutes
          </label>

          <div className="flex gap-3">
            <input
              type="number"
              min={5}
              max={720}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
            />
            <button
              onClick={() => applyCustomDuration(customMinutes)}
              className="px-5 py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500"
            >
              Apply
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Example: 120 = 2 hours, 240 = 4 hours.
          </p>
        </div>
      )}

      <div className="flex flex-col items-center mb-8">
        <div className="relative w-72 h-72">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="12"
            />
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke={currentColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-white font-mono tracking-tight">
              {timeText}
            </div>
            <div className="text-slate-400 text-sm mt-2">{currentLabel}</div>
            <div className="text-xs text-slate-600 mt-1">
              {currentDurationMinutes} minutes
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-full pointer-events-none transition-all duration-500"
            style={running ? { boxShadow: `0 0 60px ${currentColor}30` } : {}}
          />
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={reset}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className="w-20 h-20 rounded-3xl text-white font-bold flex items-center justify-center shadow-2xl transition-all duration-300 hover:-translate-y-1"
            style={{
              background: `linear-gradient(135deg, ${currentColor}, ${currentColor}cc)`,
              boxShadow: `0 0 40px ${currentColor}50`,
            }}
          >
            {running ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>

          <button
            onClick={handleComplete}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-green-400 hover:bg-green-500/10 transition-all flex items-center justify-center"
            title="Mark complete"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 mb-4">
          <label className="text-sm text-slate-300 font-medium mb-3 block">
            Studying
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubjectId("")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm border transition-all",
                !selectedSubjectId
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                  : "border-white/10 text-slate-500 hover:text-slate-300",
              )}
            >
              General
            </button>

            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm border transition-all",
                  selectedSubjectId === subject.id
                    ? "text-white"
                    : "border-white/10 text-slate-500 hover:text-slate-300",
                )}
                style={
                  selectedSubjectId === subject.id
                    ? {
                        background: `${subject.color}20`,
                        borderColor: `${subject.color}50`,
                        color: subject.color,
                      }
                    : {}
                }
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white">
              Sessions today
            </span>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.max(4, completed) }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-sm",
                  i < completed
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-slate-600",
                )}
              >
                {i < completed ? "✓" : i + 1}
              </div>
            ))}

            <span className="text-sm text-slate-500 ml-2">
              {completed} completed
            </span>
          </div>
        </div>

        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">
              Today&apos;s Study Time
            </span>
            <span className="text-sm text-violet-400">
              {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
            </span>
          </div>

          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${todayProgress}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Goal: 6h · {todayProgress}% completed
          </p>
        </div>
      </div>
    </div>
  );
}
