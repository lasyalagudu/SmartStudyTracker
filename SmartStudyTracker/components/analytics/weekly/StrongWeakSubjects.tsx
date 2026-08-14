import { AlertTriangle, Star } from "lucide-react";

interface SubjectStudy {
  id: string;
  name: string;
  color: string;
  minutes: number;
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function SubjectCard({
  title,
  subject,
  type,
}: {
  title: string;
  subject: SubjectStudy | null;
  type: "strong" | "weak";
}) {
  const Icon = type === "strong" ? Star : AlertTriangle;

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={
            type === "strong"
              ? "p-2 rounded-xl bg-green-500/10 text-green-400"
              : "p-2 rounded-xl bg-orange-500/10 text-orange-400"
          }
        >
          <Icon className="w-4 h-4" />
        </div>

        <h3 className="font-semibold text-white">{title}</h3>
      </div>

      {subject ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: subject.color }}
            />
            <span className="text-lg font-bold text-white">
              {subject.name}
            </span>
          </div>

          <p className="text-sm text-slate-400">
            {type === "strong"
              ? `${formatMinutes(subject.minutes)} studied this week. Great momentum.`
              : `${formatMinutes(subject.minutes)} studied this week. Give this subject more attention.`}
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-500">
          Study with subject selected to see this insight.
        </p>
      )}
    </div>
  );
}

export default function StrongWeakSubjects({
  strongSubject,
  weakSubject,
}: {
  strongSubject: SubjectStudy | null;
  weakSubject: SubjectStudy | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SubjectCard
        title="Strong Subject"
        subject={strongSubject}
        type="strong"
      />

      <SubjectCard
        title="Needs Attention"
        subject={weakSubject}
        type="weak"
      />
    </div>
  );
}