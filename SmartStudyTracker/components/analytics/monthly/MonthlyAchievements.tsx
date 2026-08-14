"use client";

import {
  Award,
  Lock,
  Flame,
  Clock3,
  BookOpen,
  Target,
} from "lucide-react";

interface Achievement {
  title: string;
  unlocked: boolean;
}

interface Props {
  achievements: Achievement[];
}

const ICONS = [
  Flame,
  Clock3,
  BookOpen,
  Target,
  Award,
];

export default function MonthlyAchievements({
  achievements,
}: Props) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="mb-5">
        <h3 className="text-white font-semibold">
          Achievements
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          Unlock badges by maintaining your study habits.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {achievements.map((achievement, index) => {
          const Icon = ICONS[index % ICONS.length];

          return (
            <div
              key={achievement.title}
              className={`rounded-xl border p-4 transition-all ${
                achievement.unlocked
                  ? "border-violet-500/30 bg-violet-500/10"
                  : "border-white/8 bg-white/[0.02]"
              }`}
            >
              <div className="flex justify-between items-start">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    achievement.unlocked
                      ? "bg-violet-500/20 text-violet-400"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {!achievement.unlocked && (
                  <Lock className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <h4 className="mt-4 text-sm font-semibold text-white">
                {achievement.title}
              </h4>

              <p className="text-xs text-slate-500 mt-1">
                {achievement.unlocked
                  ? "Unlocked this month 🎉"
                  : "Keep studying to unlock"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}