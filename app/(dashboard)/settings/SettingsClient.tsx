"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Loader2,
  Save,
  Target,
  CalendarDays,
  BookOpen,
  Plus,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

// ─── Delete Account Confirmation Dialog ───────────────────────────────────────

function DeleteAccountDialog({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === "DELETE";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0A0F1E] border border-red-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Delete Account</h3>
              <p className="text-xs text-slate-500">This cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={deleting}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-5 space-y-1.5 text-sm text-slate-400">
          <p>All your data will be permanently erased:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Exam setup, subjects and topics</li>
            <li>Study sessions and timer history</li>
            <li>Tasks, planner entries</li>
            <li>Mistakes book</li>
            <li>Analytics and streaks</li>
          </ul>
        </div>

        <div className="mb-5">
          <label className="text-sm text-slate-300 mb-2 block">
            Type <span className="text-red-400 font-mono font-semibold">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-red-500/60 transition-all font-mono"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 border border-white/15 text-slate-300 rounded-xl text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete || deleting}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            Delete Everything
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
        checked ? "bg-violet-600" : "bg-white/10"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsClient({
  profile,
  exams,
  activeExam,
}: {
  profile: any;
  exams: any[];
  activeExam: any;
}) {
  const router = useRouter();
  const { signOut } = useClerk();

  // Profile
  const [name, setName] = useState(profile.name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Exam setup
  const [examName, setExamName] = useState(activeExam?.name || "");
  const [targetDate, setTargetDate] = useState(
    activeExam?.targetDate
      ? new Date(activeExam.targetDate).toISOString().split("T")[0]
      : "",
  );
  const [savingExam, setSavingExam] = useState(false);

  // Create new exam
  const [newExamName, setNewExamName] = useState("");
  const [creatingExam, setCreatingExam] = useState(false);

  // Goals
  const [goalHours, setGoalHours] = useState(
    Math.floor((profile.dailyStudyGoalMinutes ?? 360) / 60),
  );
  const [goalMinutes, setGoalMinutes] = useState(
    (profile.dailyStudyGoalMinutes ?? 360) % 60,
  );
  const [dailyTaskGoal, setDailyTaskGoal] = useState(
    profile.dailyTaskGoal ?? 5,
  );
  const [savingGoals, setSavingGoals] = useState(false);

  // Notifications — controlled state, saved to API on toggle
  const existingPrefs =
    typeof profile.notificationPrefs === "object" &&
    profile.notificationPrefs !== null
      ? profile.notificationPrefs
      : {};
  const [dailyReminder, setDailyReminder] = useState(
    existingPrefs.dailyReminder ?? true,
  );
  const [revisionAlerts, setRevisionAlerts] = useState(
    existingPrefs.revisionAlerts ?? true,
  );
  const [streakNotifications, setStreakNotifications] = useState(
    existingPrefs.streakNotifications ?? true,
  );
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Delete account
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function saveProfile() {
    setSavingProfile(true);
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSavingProfile(false);
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to update profile"); return; }
    toast.success("Profile updated!");
  }

  async function saveExamSetup() {
    if (!activeExam?.id) return;
    setSavingExam(true);
    const res = await fetch("/api/settings/exam", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: activeExam.id, name: examName, targetDate: targetDate || null }),
    });
    setSavingExam(false);
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to update exam"); return; }
    toast.success("Exam setup updated!");
  }

  async function createExam() {
    if (!newExamName.trim()) return;
    setCreatingExam(true);
    const res = await fetch("/api/exams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newExamName.trim() }),
    });
    setCreatingExam(false);
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to create exam"); return; }
    toast.success("Exam created!");
    setNewExamName("");
    // router.refresh() re-runs server components — no full page reload needed.
    router.refresh();
  }

  async function saveGoals() {
    setSavingGoals(true);
    const res = await fetch("/api/settings/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dailyStudyGoalMinutes: goalHours * 60 + goalMinutes,
        dailyTaskGoal,
      }),
    });
    setSavingGoals(false);
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to update goals"); return; }
    toast.success("Study goals updated!");
  }

  async function saveNotificationPref(
    key: "dailyReminder" | "revisionAlerts" | "streakNotifications",
    value: boolean,
  ) {
    setSavingNotifs(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) toast.error("Could not save notification preference");
    } catch {
      toast.error("Network error saving preference");
    } finally {
      setSavingNotifs(false);
    }
  }

  function handleToggle(
    key: "dailyReminder" | "revisionAlerts" | "streakNotifications",
    setter: (v: boolean) => void,
    current: boolean,
  ) {
    const next = !current;
    setter(next);
    saveNotificationPref(key, next);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete account");
        setDeleting(false);
        return;
      }
      // Sign out client-side then hard redirect to home.
      await signOut({ redirectUrl: "/" });
    } catch {
      toast.error("Network error — account not deleted");
      setDeleting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {showDeleteDialog && (
        <DeleteAccountDialog
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteDialog(false)}
          deleting={deleting}
        />
      )}

      <div className="max-w-2xl" id="exam-setup">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your account, exam setup, and preferences.
          </p>
        </div>

        <div className="space-y-4">

          {/* Exam Setup */}
          <div className="bg-[#0A0F1E] border border-violet-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-4 h-4 text-violet-400" />
              <h3 className="font-semibold text-white">Exam Setup</h3>
            </div>

            {!activeExam ? (
              <p className="text-sm text-slate-400">No active exam. Create one below.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Exam Name</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="GATE, CAT, UPSC..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Target Exam Date</label>
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60 transition-all"
                    />
                    <button
                      onClick={saveExamSetup}
                      disabled={savingExam || !examName.trim()}
                      className="px-5 py-3 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingExam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-medium text-white">Subjects</span>
                    </div>
                    <Link
                      href="/syllabus"
                      className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                    >
                      <Plus className="w-3 h-3" />Add Subject
                    </Link>
                  </div>

                  {activeExam.subjects?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeExam.subjects.map((s: any) => (
                        <span
                          key={s.id}
                          className="text-xs px-2 py-1 rounded-lg border"
                          style={{ background: `${s.color}20`, borderColor: `${s.color}40`, color: s.color }}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No subjects yet. Add them from Syllabus Tracker.
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <CalendarDays className="w-3 h-3" />
                  You can update this any time from here.
                </p>
              </div>
            )}

            <div className="mt-6 border-t border-white/10 pt-6">
              <h4 className="text-white font-medium mb-3">Create New Exam</h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createExam()}
                  placeholder="CAT 2026, UPSC 2027..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all"
                />
                <button
                  onClick={createExam}
                  disabled={creatingExam || !newExamName.trim()}
                  className="px-5 py-3 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {creatingExam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-violet-400" />
              <h3 className="font-semibold text-white">Profile</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60 transition-all"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Email</label>
                <input
                  type="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="w-full px-4 py-3 bg-white/3 border border-white/5 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Study Goals */}
          <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Settings className="w-4 h-4 text-violet-400" />
              <h3 className="font-semibold text-white">Study Goals</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Daily Study Goal</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number" min="0" max="16" value={goalHours}
                      onChange={(e) => setGoalHours(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60"
                    />
                    <p className="text-xs text-slate-500 mt-1">Hours</p>
                  </div>
                  <div>
                    <input
                      type="number" min="0" max="59" value={goalMinutes}
                      onChange={(e) => setGoalMinutes(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60"
                    />
                    <p className="text-xs text-slate-500 mt-1">Minutes</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Daily Task Goal</label>
                <input
                  type="number" min="1" max="20" value={dailyTaskGoal}
                  onChange={(e) => setDailyTaskGoal(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60"
                />
              </div>
              <button
                onClick={saveGoals}
                disabled={savingGoals}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
              >
                {savingGoals ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Goals
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-violet-400" />
                <h3 className="font-semibold text-white">Notifications</h3>
              </div>
              {savingNotifs && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
            </div>

            <div className="space-y-4">
              {[
                {
                  key: "dailyReminder" as const,
                  label: "Daily study reminder",
                  description: "Get a reminder to start your daily study session",
                  value: dailyReminder,
                  setter: setDailyReminder,
                },
                {
                  key: "revisionAlerts" as const,
                  label: "Revision due alerts",
                  description: "Alerts when topics are due for revision",
                  value: revisionAlerts,
                  setter: setRevisionAlerts,
                },
                {
                  key: "streakNotifications" as const,
                  label: "Streak notifications",
                  description: "Reminders to protect your study streak",
                  value: streakNotifications,
                  setter: setStreakNotifications,
                },
              ].map(({ key, label, description, value, setter }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-300">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  </div>
                  <Toggle
                    checked={value}
                    onChange={() => handleToggle(key, setter, value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#0A0F1E] border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-400" />
              <h3 className="font-semibold text-red-400">Danger Zone</h3>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Permanently deletes your account, all study data, exams, tasks,
              analytics, and mistakes. This cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-colors"
            >
              Delete Account
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
