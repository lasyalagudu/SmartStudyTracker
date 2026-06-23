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
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsClient({
  profile,
  exams,
  activeExam,
}: {
  profile: any;
  exams: any[];
  activeExam: any;
}) {
  const [name, setName] = useState(profile.name || "");
  const [examName, setExamName] = useState(activeExam?.name || "");
  const [targetDate, setTargetDate] = useState(
    activeExam?.targetDate
      ? new Date(activeExam.targetDate).toISOString().split("T")[0]
      : "",
  );

  const [newExamName, setNewExamName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [creatingExam, setCreatingExam] = useState(false);

  async function saveProfile() {
    setSavingProfile(true);

    const response = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const result = await response.json();
    setSavingProfile(false);

    if (!response.ok) {
      toast.error(result.error || "Failed to update profile");
      return;
    }

    toast.success("Profile updated!");
  }

  async function saveExamSetup() {
    if (!activeExam?.id) return;

    setSavingExam(true);

    const response = await fetch("/api/settings/exam", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examId: activeExam.id,
        name: examName,
        targetDate: targetDate || null,
      }),
    });

    const result = await response.json();
    setSavingExam(false);

    if (!response.ok) {
      toast.error(result.error || "Failed to update exam setup");
      return;
    }

    toast.success("Exam setup updated!");
  }

  async function createExam() {
    if (!newExamName.trim()) return;

    setCreatingExam(true);

    const response = await fetch("/api/exams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newExamName.trim() }),
    });

    const result = await response.json();
    setCreatingExam(false);

    if (!response.ok) {
      toast.error(result.error || "Failed to create exam");
      return;
    }

    toast.success("Exam created!");
    window.location.reload();
  }

  return (
    <div className="max-w-2xl" id="exam-setup">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your account, exam setup and preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-[#0A0F1E] border border-violet-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-4 h-4 text-violet-400" />
            <h3 className="font-semibold text-white">Exam Setup</h3>
          </div>

          {!activeExam ? (
            <div className="text-sm text-slate-400">
              No active exam found. Create a new exam below.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Exam Name
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="GATE, CAT, UPSC..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60 transition-all"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Target Exam Date
                </label>
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
                    {savingExam ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-white">
                      Subjects
                    </span>
                  </div>

                  <Link
                    href="/syllabus"
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                  >
                    <Plus className="w-3 h-3" />
                    Add Subject
                  </Link>
                </div>

                {activeExam.subjects?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeExam.subjects.map((subject: any) => (
                      <span
                        key={subject.id}
                        className="text-xs px-2 py-1 rounded-lg border"
                        style={{
                          background: `${subject.color}20`,
                          borderColor: `${subject.color}40`,
                          color: subject.color,
                        }}
                      >
                        {subject.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No subjects added yet. Add subjects from Syllabus Tracker.
                  </p>
                )}
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <CalendarDays className="w-3 h-3" />
                You can edit this anytime. This is your permanent onboarding
                setup area.
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-white/10 pt-6">
            <h4 className="text-white font-medium mb-3">Create New Exam</h4>

            <div className="flex gap-3">
              <input
                type="text"
                value={newExamName}
                onChange={(e) => setNewExamName(e.target.value)}
                placeholder="CAT 2026, UPSC 2027..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all"
              />

              <button
                onClick={createExam}
                disabled={creatingExam || !newExamName.trim()}
                className="px-5 py-3 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {creatingExam ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
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
              <label className="text-sm text-slate-300 mb-2 block">
                Full Name
              </label>
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
              {savingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
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
              <label className="text-sm text-slate-300 mb-2 block">
                Daily Study Goal (hours)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                defaultValue={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60 transition-all"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Daily Task Goal
              </label>
              <input
                type="number"
                min="1"
                max="20"
                defaultValue={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-violet-400" />
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>

          <div className="space-y-3">
            {[
              "Daily study reminder",
              "Revision due alerts",
              "Streak notifications",
            ].map((label) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-violet-600 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#0A0F1E] border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-red-400">Danger Zone</h3>
          </div>

          <p className="text-sm text-slate-500 mb-4">
            These actions are irreversible. Proceed with caution.
          </p>

          <button className="px-4 py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
