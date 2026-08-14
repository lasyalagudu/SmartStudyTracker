import Link from 'next/link';
import { RefreshCw, ExternalLink } from 'lucide-react';
import type { Subject } from '@/types';

interface Props {
  subjects: Subject[];
}

export default function RevisionDue({ subjects }: Props) {
  const revisionTopics = subjects.flatMap((s) =>
    (s.topics ?? [])
      .filter((t) => t.theory_done && !t.revision_done)
      .slice(0, 2)
      .map((t) => ({ ...t, subjectName: s.name, color: s.color }))
  ).slice(0, 4);

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-orange-400" />
          <h3 className="font-semibold text-white">Revision Due</h3>
        </div>
        <Link href="/syllabus" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
          View All <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {revisionTopics.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-sm">No revisions pending. Great job!</div>
        )}
        {revisionTopics.map((topic) => (
          <div key={topic.id} className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-xl">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${topic.color}20` }}
            >
              <RefreshCw className="w-4 h-4" style={{ color: topic.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {topic.subjectName} – {topic.name}
              </div>
              <div className="text-xs text-orange-400">Due Today</div>
            </div>
            <Link
              href="/syllabus"
              className="px-3 py-1.5 text-xs bg-orange-500/15 text-orange-300 border border-orange-500/20 rounded-lg hover:bg-orange-500/25 transition-colors flex-shrink-0"
            >
              Revise Now
            </Link>
          </div>
        ))}
      </div>

      <Link href="/mistakes" className="block mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors">
        Go to Mistakes Book →
      </Link>
    </div>
  );
}
