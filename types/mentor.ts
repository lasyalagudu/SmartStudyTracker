/**
 * types/mentor.ts
 * TypeScript types for the Mentor Connect module.
 * All fields match Prisma camelCase output exactly.
 */

export type MentorStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type AchievementStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PAYMENT_FAILED" | "REFUNDED";
export type PaymentStatus = "CREATED" | "CAPTURED" | "FAILED" | "REFUNDED";
export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface MentorExam {
  id: string;
  mentorId: string;
  examName: string;
  examYear: number;
  rank: string | null;
  score: string | null;
  college: string | null;
  description: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MentorAchievement {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  fileUrl: string | null;
  fileType: string | null;
  status: AchievementStatus;
  adminNote: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  durationMins: number;
  priceInPaise: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MentorAvailability {
  id: string;
  mentorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface MentorProfile {
  id: string;
  userId: string;
  headline: string;
  about: string;
  photoUrl: string | null;
  primaryExam: string;
  college: string;
  languages: string[];
  experienceYears: number;
  linkedinUrl: string | null;
  status: MentorStatus;
  adminNote: string | null;
  avgRating: number;
  totalReviews: number;
  totalSessions: number;
  totalEarnings: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Relations (optional — present when included)
  user?: { id: string; name: string | null; email: string };
  exams?: MentorExam[];
  achievements?: MentorAchievement[];
  sessions?: MentorSession[];
  availability?: MentorAvailability[];
  reviews?: MentorReview[];
}

export interface MentorReview {
  id: string;
  bookingId: string;
  studentId: string;
  mentorId: string;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  student?: { name: string | null; email: string };
}

export interface MentorBooking {
  id: string;
  studentId: string;
  mentorId: string;
  sessionId: string;
  scheduledAt: string | Date;
  durationMins: number;
  status: BookingStatus;
  meetingUrl: string | null;
  studentNote: string | null;
  mentorNote: string | null;
  amountInPaise: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  student?: { id: string; name: string | null; email: string };
  mentor?: MentorProfile;
  session?: MentorSession;
  payment?: MentorPayment | null;
  review?: MentorReview | null;
}

export interface MentorPayment {
  id: string;
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  amountInPaise: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Lightweight card shape for discovery listing
export interface MentorCard {
  id: string;
  headline: string;
  about: string;
  photoUrl: string | null;
  primaryExam: string;
  college: string;
  avgRating: number;
  totalReviews: number;
  totalSessions: number;
  status: MentorStatus;
  user: { name: string | null };
  exams: Pick<MentorExam, "id" | "examName" | "examYear" | "rank" | "score" | "college">[];
  sessions: Pick<MentorSession, "id" | "title" | "durationMins" | "priceInPaise">[];
  achievements: Pick<MentorAchievement, "id" | "status">[];
}
