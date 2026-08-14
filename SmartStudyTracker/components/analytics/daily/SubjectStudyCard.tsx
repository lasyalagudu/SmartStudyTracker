"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";

interface SubjectStudy {
  id: string;
  name: string;
  color: string;
  minutes: number;
}

interface Props {
  subjects: SubjectStudy[];
}

export default function SubjectStudyCard({ subjects }: Props) {
  const totalMinutes = subjects.reduce(
    (sum, subject) => sum + subject.minutes,
    0
  );

  return (
    <Card className="bg-[#0F172A] border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BookOpen className="w-5 h-5 text-violet-400" />
          Subject Study Time
        </CardTitle>
      </CardHeader>

      <CardContent>
        {subjects.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No study sessions recorded today.
          </div>
        ) : (
          <div className="space-y-6">
            {subjects.map((subject) => {
              const percentage =
                totalMinutes > 0
                  ? Math.round((subject.minutes / totalMinutes) * 100)
                  : 0;

              return (
                <div
                  key={subject.id}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: subject.color,
                        }}
                      />

                      <span className="font-medium text-slate-200">
                        {subject.name}
                      </span>

                    </div>

                    <div className="text-right">

                      <p className="text-sm font-semibold text-white">
                        {subject.minutes} min
                      </p>

                      <p className="text-xs text-slate-400">
                        {percentage}%
                      </p>

                    </div>

                  </div>

                  <Progress
                    value={percentage}
                    className="h-2"
                  />

                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}