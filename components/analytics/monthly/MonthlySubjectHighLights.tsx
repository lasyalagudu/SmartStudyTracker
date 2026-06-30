"use client";

import { Trophy, AlertTriangle, Clock3 } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
  minutes: number;
  sessions: number;
}

interface Props {
  bestSubject: Subject | null;
  weakSubject: Subject | null;
}

function formatMinutes(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs}h ${mins}m`;
}

export default function MonthlySubjectHighlights({
  bestSubject,
  weakSubject,
}: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Best Subject */}

      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-emerald-400" />
          </div>

          <div>
            <h3 className="text-white font-semibold">
              Best Subject
            </h3>

            <p className="text-sm text-slate-500">
              Most studied this month
            </p>
          </div>
        </div>

        {bestSubject ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  background: bestSubject.color,
                }}
              />

              <span className="text-xl font-semibold text-white">
                {bestSubject.name}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Study Time</span>

                <span className="text-white">
                  {formatMinutes(bestSubject.minutes)}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Sessions</span>

                <span className="text-white">
                  {bestSubject.sessions}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-500 text-sm">
            No study data available.
          </div>
        )}
      </div>

      {/* Weak Subject */}

      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>

          <div>
            <h3 className="text-white font-semibold">
              Needs Attention
            </h3>

            <p className="text-sm text-slate-500">
              Least studied subject
            </p>
          </div>
        </div>

        {weakSubject ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  background: weakSubject.color,
                }}
              />

              <span className="text-xl font-semibold text-white">
                {weakSubject.name}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Study Time</span>

                <span className="text-white">
                  {formatMinutes(weakSubject.minutes)}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Sessions</span>

                <span className="text-white">
                  {weakSubject.sessions}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
              <Clock3 className="w-4 h-4" />
              Try spending more time on this subject next week.
            </div>
          </>
        ) : (
          <div className="text-slate-500 text-sm">
            No study data available.
          </div>
        )}
      </div>
    </div>
  );
}