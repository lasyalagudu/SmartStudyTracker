import Link from 'next/link';
import { BarChart3, ExternalLink } from 'lucide-react';
import type { Subject } from '@/types';
import { cn } from '@/lib/utils';

const SUBJECT_COLORS = ['#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626', '#0891B2'];

interface Props {
  subjects: Subject[];
  overallProgress: number;
}

export default function StudyProgress({ subjects, overallProgress }: Props) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          <h3 className="font-semibold text-white">Study Progress</h3>
        </div>
        <Link href="/analytics" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
          View Progress <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex items-center gap-6 mb-6">
        {/* Circular progress */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke="url(#prog-gradient)" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${overallProgress * 2.51} 251`}
            />
            <defs>
              <linearGradient id="prog-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#0891B2" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{overallProgress}%</span>
          </div>
        </div>

        {/* Subject bars */}
        <div className="flex-1 space-y-3">
          {subjects.slice(0, 5).map((subject, i) => {
            const total = subject.topics?.length ?? 0;
            const done = subject.topics?.filter((t) => t.status === 'COMPLETED' || t.mastered).length ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const color = subject.color ?? SUBJECT_COLORS[i % SUBJECT_COLORS.length];
            return (
              <div key={subject.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-300 font-medium">{subject.name}</span>
                  <span className="text-xs text-slate-500">{pct}%</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Link href="/syllabus" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
        View All Subjects →
      </Link>
    </div>
  );
}
