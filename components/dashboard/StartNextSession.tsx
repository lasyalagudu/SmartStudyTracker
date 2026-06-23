import Link from 'next/link';
import { Play, Clock, Plus } from 'lucide-react';
import type { Subject } from '@/types';

interface Props {
  subjects: Subject[];
}

export default function StartNextSession({ subjects }: Props) {
  const nextSubject = subjects.find((s) => (s.topics ?? []).some((t) => t.status !== 'COMPLETED'));
  const nextTopic = nextSubject?.topics?.find((t) => t.status !== 'COMPLETED');

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 w-40 h-40 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-tl from-violet-600 to-transparent rounded-tl-full" />
      </div>

      <div className="flex items-center justify-between mb-5 relative">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-violet-400" />
          <h3 className="font-semibold text-white">Start Next Session</h3>
        </div>
        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <Plus className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {nextSubject && nextTopic ? (
        <div className="relative space-y-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: `${nextSubject.color}20`, color: nextSubject.color }}
            >
              {nextSubject.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Subject</div>
              <div className="text-xl font-bold text-white">{nextSubject.name}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-0.5">Task</div>
            <div className="text-base font-semibold text-white">{nextTopic.name}</div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            <span>Estimated Time</span>
            <span className="text-white font-medium ml-auto">45 mins</span>
          </div>

          <Link
            href="/timer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-violet-400 transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
          >
            <Play className="w-4 h-4" />
            Start Study Session
          </Link>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎉</div>
          <div className="text-white font-semibold mb-1">All caught up!</div>
          <div className="text-sm text-slate-500">Add more topics to your syllabus to continue.</div>
          <Link href="/syllabus" className="mt-4 inline-block text-sm text-violet-400 hover:text-violet-300">
            Go to Syllabus →
          </Link>
        </div>
      )}
    </div>
  );
}
