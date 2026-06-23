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
