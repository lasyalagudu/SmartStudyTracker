import { BookOpen, CalendarDays, Timer, BarChart3, FileWarning, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Syllabus Tracker',
    description: 'Track every topic with granular checkpoints — Theory, Problems, PYQs, Revision, and Mastery. See your real-time completion percentage per subject.',
    color: 'from-violet-500 to-violet-600',
    glow: 'rgba(124,58,237,0.3)',
  },
  {
    icon: CalendarDays,
    title: 'Daily Planner',
    description: 'Plan your study day with task management. Add tasks, set priorities, and track daily completion to stay on schedule for your exam.',
    color: 'from-blue-500 to-blue-600',
    glow: 'rgba(37,99,235,0.3)',
  },
  {
    icon: Timer,
    title: 'Pomodoro Timer',
    description: 'Stay in the zone with a focused Pomodoro timer. Track study sessions, take scheduled breaks, and build an unbreakable study streak.',
    color: 'from-cyan-500 to-cyan-600',
    glow: 'rgba(8,145,178,0.3)',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Visualize your progress with detailed charts. Understand study patterns, subject-wise completion, and daily hours to optimize your preparation.',
    color: 'from-green-500 to-emerald-600',
    glow: 'rgba(5,150,105,0.3)',
  },
  {
    icon: FileWarning,
    title: 'Mistakes Book',
    description: 'Log your mistakes and revisit them before the exam. Categorize by type, track resolution, and never repeat the same error twice.',
    color: 'from-orange-500 to-amber-600',
    glow: 'rgba(217,119,6,0.3)',
  },
  {
    icon: CheckCircle,
    title: 'Progress Dashboard',
    description: 'Get a bird-eye view of your preparation — streak count, topics completed, days remaining, and revision due reminders all in one dashboard.',
    color: 'from-pink-500 to-rose-600',
    glow: 'rgba(219,39,119,0.3)',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-sm font-medium mb-6">
            Everything you need
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Built for{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              serious aspirants
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Every feature is designed to maximize your study efficiency and keep you on track for exam day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative bg-[#0A0F1E] border border-white/8 rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30 hover:-translate-y-1"
                style={{ '--glow': feature.glow } as React.CSSProperties}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `0 0 30px ${feature.glow}` }} />
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
