import { Flame, Clock, Calendar, Target } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  streak: number;
  daysLeft: number | null;
  targetDate: string | null;
  overallProgress: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
}

export default function StatsCards({ streak, daysLeft, targetDate, overallProgress, todayMinutes, dailyGoalMinutes }: Props) {
  const studyHours = Math.floor(todayMinutes / 60);
  const studyMins = todayMinutes % 60;
  const studyTimeLabel = todayMinutes > 0 ? `${studyHours}h ${studyMins}m` : '0h 0m';
  const goalHours = Math.floor(dailyGoalMinutes / 60);
  const goalProgress = dailyGoalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100)) : 0;

  const stats = [
    {
      icon: Flame,
      value: streak.toString(),
      label: 'Day Streak',
      sub: streak > 0 ? 'Keep it up! 🔥' : 'Start today!',
      subColor: 'text-orange-400',
      iconBg: 'from-orange-500 to-red-600',
      glow: 'rgba(234,88,12,0.2)',
    },
    {
      icon: Clock,
      value: studyTimeLabel,
      label: "Today's Study Time",
      sub: `Goal: ${goalHours}h 00m`,
      subColor: 'text-slate-500',
      progress: goalProgress,
      iconBg: 'from-violet-500 to-violet-700',
      glow: 'rgba(124,58,237,0.2)',
    },
    {
      icon: Calendar,
      value: daysLeft !== null ? daysLeft.toString() : '—',
      label: 'Days Left',
      sub: targetDate ? formatDate(targetDate) : 'No date set',
      subColor: 'text-slate-500',
      iconBg: 'from-green-500 to-emerald-700',
      glow: 'rgba(5,150,105,0.2)',
    },
    {
      icon: Target,
      value: `${overallProgress}%`,
      label: 'Syllabus Completed',
      sub: null,
      action: 'View Progress →',
      iconBg: 'from-cyan-500 to-blue-700',
      glow: 'rgba(8,145,178,0.2)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 hover:border-violet-500/20 transition-all duration-300 card-hover"
          >
            <div className={cn('inline-flex p-2.5 rounded-xl bg-gradient-to-br mb-3', s.iconBg)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-0.5">{s.value}</div>
            <div className="text-sm text-slate-400 mb-2">{s.label}</div>
            {s.progress !== undefined && (
              <div className="progress-bar mb-1.5">
                <div className="progress-fill" style={{ width: `${s.progress}%` }} />
              </div>
            )}
            {s.sub && <div className={cn('text-xs', s.subColor)}>{s.sub}</div>}
            {s.action && (
              <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">{s.action}</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
