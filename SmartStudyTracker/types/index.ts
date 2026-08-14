/**
 * Application-level types aligned with the Prisma schema (camelCase).
 *
 * Previously these used snake_case field names (user_id, theory_done, etc.)
 * which didn't match what Prisma actually returns, causing silent runtime
 * mismatches throughout the codebase.
 */

export interface Profile {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  onboardingCompleted: boolean;
  streakCount: number;
  dailyStudyGoalMinutes: number;
  dailyTaskGoal: number;
  lastStudyDate: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Exam {
  id: string;
  userId: string;
  name: string;
  targetDate: Date | string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Subject {
  id: string;
  examId: string;
  name: string;
  color: string;
  order: number;
  topics?: Topic[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  theoryDone: boolean;
  problemsDone: boolean;
  pyqsDone: boolean;
  revisionDone: boolean;
  mastered: boolean;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedHours: number;
  confidence: number;
  completedAt: Date | string | null;
  lastRevisedAt: Date | string | null;
  notes: string | null;
  doubts: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Task {
  id: string;
  userId: string;
  examId: string | null;
  subjectId: string | null;
  topicId: string | null;
  title: string;
  description: string | null;
  dueDate: Date | string | null;
  completed: boolean;
  completedAt: Date | string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: Date | string;
  updatedAt: Date | string;
  subject?: Subject | null;
  topic?: Topic | null;
}

export interface TimerSession {
  id: string;
  userId: string;
  examId: string | null;
  subjectId: string | null;
  topicId: string | null;
  durationMinutes: number;
  sessionType: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";
  completed: boolean;
  startedAt: Date | string;
  endedAt: Date | string | null;
  createdAt: Date | string;
}

export interface Mistake {
  id: string;
  userId: string;
  subjectId: string | null;
  topicId: string | null;
  title: string;
  description: string | null;
  mistakeType: "CONCEPTUAL" | "CALCULATION" | "CARELESS" | "OTHER";
  resolved: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  subject?: Subject | null;
  topic?: Topic | null;
}

export interface MonthlyAnalytics {
  exam: {
    id: string;
    name: string;
    targetDate?: Date | string | null;
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
  bestSubject: SubjectStudySummary | null;
  weakSubject: SubjectStudySummary | null;
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

export interface SubjectStudySummary {
  id: string;
  name: string;
  color: string;
  minutes: number;
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
  lastRevisedAt: Date | string | null;
  completedAt: Date | string | null;
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
