"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarDays,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { greetUser, daysUntil } from "@/lib/utils";

import StatsCards from "@/components/dashboard/StatsCards";
import TodaysTasks from "@/components/dashboard/TodaysTasks";
import StudyProgress from "@/components/dashboard/StudyProgress";
import RevisionDue from "@/components/dashboard/RevisionDue";
import StartNextSession from "@/components/dashboard/StartNextSession";
import LogStudyDialog from "@/components/dashboard/LogStudyDiallog";

export default function DashboardClient({
  profile,
  exam,
  subjects,
  tasks,
  todayMinutes,
}: {
  profile: any;
  exam: any;
  subjects: any[];
  tasks: any[];
  todayMinutes: number;
}) {
  const [taskList, setTaskList] = useState(tasks);

  const [todayStudyMinutes, setTodayStudyMinutes] =
    useState(todayMinutes);

  const [streak, setStreak] = useState(
    profile?.streakCount ?? 0
  );

  const [showLogStudy, setShowLogStudy] = useState(false);

  const totalTopics = subjects.reduce(
    (acc, subject) => acc + (subject.topics?.length ?? 0),
    0
  );

  const completedTopics = subjects.reduce(
    (acc, subject) =>
      acc +
      (subject.topics?.filter(
        (topic: any) =>
          topic.status === "COMPLETED" || topic.mastered
      ).length ?? 0),
    0
  );

  const overallProgress =
    totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;

  const daysLeft = exam?.targetDate
    ? daysUntil(exam.targetDate)
    : null;

  const missingTargetDate = !exam?.targetDate;
  const missingSubjects = subjects.length === 0;

  const showSetupReminder =
    missingTargetDate || missingSubjects;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {greetUser(profile?.name ?? null)}{" "}
          <span className="text-2xl">👋</span>
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Consistency today, success tomorrow.
        </p>
      </div>

      {/* Setup Reminder */}
      {showSetupReminder && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-violet-300" />
            </div>

            <div className="flex-1">
              <h2 className="text-white font-semibold">
                Complete your exam setup
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                You skipped a few details during onboarding.
                Add them now to unlock better planning and
                progress tracking.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {missingTargetDate && (
                  <Link
                    href="/settings#exam-setup"
                    className="group rounded-xl border border-white/10 bg-[#0A0F1E] p-4 hover:border-violet-500/40 transition-all"
                  >
                    <div className="flex items-center gap-2 text-white font-medium">
                      <CalendarDays className="w-4 h-4 text-violet-400" />
                      Set target exam date
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Show countdown and deadline planning.
                    </p>

                    <div className="flex items-center gap-1 text-xs text-violet-400 mt-3">
                      Set date
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )}

                {missingSubjects && (
                  <Link
                    href="/syllabus"
                    className="group rounded-xl border border-white/10 bg-[#0A0F1E] p-4 hover:border-violet-500/40 transition-all"
                  >
                    <div className="flex items-center gap-2 text-white font-medium">
                      <BookOpen className="w-4 h-4 text-violet-400" />
                      Add your subjects
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Start tracking syllabus and topics.
                    </p>

                    <div className="flex items-center gap-1 text-xs text-violet-400 mt-3">
                      Add subjects
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <StatsCards
        streak={streak}
        daysLeft={daysLeft}
        targetDate={exam?.targetDate ?? null}
        overallProgress={overallProgress}
        todayMinutes={todayStudyMinutes}
        dailyGoalMinutes={
          profile?.dailyStudyGoalMinutes ?? 360
        }
        onLogStudy={() => setShowLogStudy(true)}
      />

      {/* Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaysTasks
          tasks={taskList}
          setTasks={setTaskList}
          userId={profile?.id ?? ""}
          examId={exam?.id ?? ""}
          subjects={subjects}
        />

        <StartNextSession subjects={subjects} />
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudyProgress
          subjects={subjects}
          overallProgress={overallProgress}
        />

        <RevisionDue subjects={subjects} />
      </div>

      {/* Offline Study Dialog */}
      {showLogStudy && (
        <LogStudyDialog
          subjects={subjects}
          onClose={() => setShowLogStudy(false)}
          onSaved={(minutes: number, newStreak: number) => {
            setTodayStudyMinutes(
              (prev) => prev + minutes
            );

            setStreak(newStreak);
          }}
        />
      )}
    </div>
  );
}