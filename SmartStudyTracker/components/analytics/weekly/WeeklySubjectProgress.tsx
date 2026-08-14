interface SubjectProgress {
  id: string;
  name: string;
  color: string;
  totalTopics: number;
  completedTopics: number;
  progress: number;
  minutes: number;
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function WeeklySubjectProgress({
  subjects,
}: {
  subjects: SubjectProgress[];
}) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-white">Subject Progress</h3>
        <p className="text-xs text-slate-500 mt-1">
          Syllabus completion and study time by subject.
        </p>
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-10 text-slate-600 text-sm">
          No subjects found. Add subjects in Syllabus to see progress.
        </div>
      )}

      <div className="space-y-5">
        {subjects.map((subject) => (
          <div key={subject.id}>
            <div className="flex items-center justify-between mb-2 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: subject.color }}
                />

                <span className="text-sm font-medium text-white truncate">
                  {subject.name}
                </span>
              </div>

              <div className="text-xs text-slate-500 flex-shrink-0">
                {formatMinutes(subject.minutes)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${subject.progress}%`,
                    background: subject.color,
                  }}
                />
              </div>

              <div className="w-12 text-right text-xs font-medium text-slate-300">
                {subject.progress}%
              </div>
            </div>

            <div className="text-xs text-slate-600 mt-1.5">
              {subject.completedTopics}/{subject.totalTopics} topics completed
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}