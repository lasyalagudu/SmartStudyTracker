export interface Profile {
  id: string;
  email: string;
  name: string | null;
  onboarding_completed: boolean;
  streak_count: number;
  last_study_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  user_id: string;
  name: string;
  target_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  exam_id: string;
  user_id: string;
  name: string;
  color: string;
  order: number;
  topics?: Topic[];
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  user_id: string;
  name: string;
  order: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  theory_done: boolean;
  problems_done: boolean;
  pyqs_done: boolean;
  revision_done: boolean;
  mastered: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  exam_id: string | null;
  subject_id: string | null;
  topic_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface TimerSession {
  id: string;
  user_id: string;
  subject_id: string | null;
  topic_id: string | null;
  duration_minutes: number;
  session_type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  completed: boolean;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface Mistake {
  id: string;
  user_id: string;
  subject_id: string | null;
  topic_id: string | null;
  title: string;
  description: string | null;
  mistake_type: 'CONCEPTUAL' | 'CALCULATION' | 'CARELESS' | 'OTHER';
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlyAnalytics {
  exam: {
    id: string;
    name: string;
    targetDate?: string;
  };

  range: {
    year: number;
    month: number;
    monthStart: string;
    monthEnd: string;
  };

  stats: {
    totalMinutes: number;
    totalSessions: number;
    activeStudyDays: number;
    consistency: number;
    monthlyGoalMinutes: number;
    monthlyGoalPercent: number;
    overallProgress: number;
    totalTopics: number;
    completedTopics: number;
    topicsCompletedThisMonth: number;
  };

  dailyMinutes: number[];

  weeklyTrend: number[];

  subjectDistribution: {
    id: string;
    name: string;
    color: string;
    minutes: number;
    sessions: number;
  }[];

  bestSubject: any;
  weakSubject: any;

  achievements: {
    title: string;
    unlocked: boolean;
  }[];

  comparison: {
    studyTimeChange: number;
    sessionsChange: number;
  };

  insight: string;
}

export interface SubjectAnalyticsTopic {
  id: string;
  name: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  priority: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
  readiness: number;
  health: "EXCELLENT" | "GOOD" | "NEEDS_REVISION" | "WEAK" | "IN_PROGRESS";
  nextAction: string;
  estimatedHours: number;
  lastRevisedAt: string | null;
  completedAt: string | null;
}

export interface SubjectAnalyticsItem {
  id: string;
  name: string;
  color: string;
  totalTopics: number;
  completedTopics: number;
  progress: number;
  totalStudyMinutes: number;
  totalSessions: number;
  averageConfidence: number;
  breakdown: {
    theoryDone: number;
    problemsDone: number;
    pyqsDone: number;
    revisionDone: number;
    mastered: number;
  };
  weakTopics: SubjectAnalyticsTopic[];
  topicHealth: SubjectAnalyticsTopic[];
}

export interface SubjectAnalyticsData {
  exam: {
    id: string;
    name: string;
  };
  subjects: SubjectAnalyticsItem[];
}

