export const EXAM_OPTIONS = [
  { id: 'GATE', label: 'GATE', icon: '🎓' },
  { id: 'JEE', label: 'JEE', icon: '⚛️' },
  { id: 'NEET', label: 'NEET', icon: '🩺' },
  { id: 'UPSC', label: 'UPSC', icon: '🏛️' },
  { id: 'CAT', label: 'CAT', icon: '📊' },
  { id: 'Placements', label: 'Placements', icon: '💼' },
  { id: 'Other', label: 'Other', icon: '📚' },
];

export const SUBJECT_COLORS = [
  '#7C3AED', // violet
  '#2563EB', // blue
  '#059669', // green
  '#D97706', // amber
  '#DC2626', // red
  '#0891B2', // cyan
  '#7C3AED', // violet
  '#DB2777', // pink
];

export const TOPIC_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export const POMODORO_SETTINGS = {
  FOCUS: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
};

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/syllabus', label: 'Syllabus Tracker', icon: 'BookOpen' },
  { href: '/planner', label: 'Daily Planner', icon: 'CalendarDays' },
  { href: '/timer', label: 'Study Timer', icon: 'Timer' },
  { href: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { href: '/mistakes', label: 'Mistakes Book', icon: 'FileWarning' },
];
