-- ─────────────────────────────────────────────────────────────────────────────
-- Mentor Connect — SQL migration
-- Safe to re-run: all statements use IF NOT EXISTS / DO $$ blocks.
-- ─────────────────────────────────────────────────────────────────────────────

-- New enums
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MentorStatus" AS ENUM ('DRAFT','PENDING_REVIEW','APPROVED','REJECTED','SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AchievementStatus" AS ENUM ('PENDING','VERIFIED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT','CONFIRMED','COMPLETED','CANCELLED','PAYMENT_FAILED','REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('CREATED','CAPTURED','FAILED','REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DayOfWeek" AS ENUM ('MON','TUE','WED','THU','FRI','SAT','SUN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add role column to existing User table (safe — no existing data lost)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- MentorProfile
CREATE TABLE IF NOT EXISTS "MentorProfile" (
  "id"              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"          TEXT        NOT NULL,
  "headline"        TEXT        NOT NULL DEFAULT '',
  "about"           TEXT        NOT NULL DEFAULT '',
  "photoUrl"        TEXT,
  "primaryExam"     TEXT        NOT NULL DEFAULT '',
  "college"         TEXT        NOT NULL DEFAULT '',
  "languages"       TEXT[]      NOT NULL DEFAULT '{}',
  "experienceYears" INTEGER     NOT NULL DEFAULT 0,
  "linkedinUrl"     TEXT,
  "status"          "MentorStatus" NOT NULL DEFAULT 'DRAFT',
  "adminNote"       TEXT,
  "avgRating"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalReviews"    INTEGER     NOT NULL DEFAULT 0,
  "totalSessions"   INTEGER     NOT NULL DEFAULT 0,
  "totalEarnings"   INTEGER     NOT NULL DEFAULT 0,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MentorProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MentorProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "MentorProfile_userId_key" UNIQUE ("userId")
);
CREATE INDEX IF NOT EXISTS "MentorProfile_status_idx"     ON "MentorProfile"("status");
CREATE INDEX IF NOT EXISTS "MentorProfile_primaryExam_idx" ON "MentorProfile"("primaryExam");
CREATE INDEX IF NOT EXISTS "MentorProfile_avgRating_idx"  ON "MentorProfile"("avgRating");

-- MentorExam
CREATE TABLE IF NOT EXISTS "MentorExam" (
  "id"          TEXT     NOT NULL DEFAULT gen_random_uuid()::text,
  "mentorId"    TEXT     NOT NULL,
  "examName"    TEXT     NOT NULL,
  "examYear"    INTEGER  NOT NULL,
  "rank"        TEXT,
  "score"       TEXT,
  "college"     TEXT,
  "description" TEXT     NOT NULL DEFAULT '',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MentorExam_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MentorExam_mentorId_fkey"
    FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "MentorExam_mentorId_idx" ON "MentorExam"("mentorId");

-- MentorAchievement
CREATE TABLE IF NOT EXISTS "MentorAchievement" (
  "id"          TEXT               NOT NULL DEFAULT gen_random_uuid()::text,
  "mentorId"    TEXT               NOT NULL,
  "title"       TEXT               NOT NULL,
  "description" TEXT               NOT NULL DEFAULT '',
  "fileUrl"     TEXT,
  "fileType"    TEXT,
  "status"      "AchievementStatus" NOT NULL DEFAULT 'PENDING',
  "adminNote"   TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MentorAchievement_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MentorAchievement_mentorId_fkey"
    FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "MentorAchievement_mentorId_idx" ON "MentorAchievement"("mentorId");
CREATE INDEX IF NOT EXISTS "MentorAchievement_status_idx"   ON "MentorAchievement"("status");

-- MentorSession
CREATE TABLE IF NOT EXISTS "MentorSession" (
  "id"           TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "mentorId"     TEXT    NOT NULL,
  "title"        TEXT    NOT NULL,
  "description"  TEXT    NOT NULL DEFAULT '',
  "durationMins" INTEGER NOT NULL,
  "priceInPaise" INTEGER NOT NULL,
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MentorSession_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MentorSession_mentorId_fkey"
    FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "MentorSession_mentorId_idx" ON "MentorSession"("mentorId");
CREATE INDEX IF NOT EXISTS "MentorSession_isActive_idx"  ON "MentorSession"("isActive");

-- MentorAvailability
CREATE TABLE IF NOT EXISTS "MentorAvailability" (
  "id"        TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "mentorId"  TEXT         NOT NULL,
  "dayOfWeek" "DayOfWeek"  NOT NULL,
  "startTime" TEXT         NOT NULL,
  "endTime"   TEXT         NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MentorAvailability_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MentorAvailability_mentorId_dayOfWeek_startTime_key"
    UNIQUE ("mentorId", "dayOfWeek", "startTime"),
  CONSTRAINT "MentorAvailability_mentorId_fkey"
    FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "MentorAvailability_mentorId_idx" ON "MentorAvailability"("mentorId");

-- MentorBlockedDate
CREATE TABLE IF NOT EXISTS "MentorBlockedDate" (
  "id"        TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "mentorId"  TEXT         NOT NULL,
  "date"      DATE         NOT NULL,
  "reason"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MentorBlockedDate_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MentorBlockedDate_mentorId_date_key" UNIQUE ("mentorId", "date"),
  CONSTRAINT "MentorBlockedDate_mentorId_fkey"
    FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "MentorBlockedDate_mentorId_idx" ON "MentorBlockedDate"("mentorId");

-- MentorBooking
CREATE TABLE IF NOT EXISTS "MentorBooking" (
  "id"            TEXT           NOT NULL DEFAULT gen_random_uuid()::text,
  "studentId"     TEXT           NOT NULL,
  "mentorId"      TEXT           NOT NULL,
  "sessionId"     TEXT           NOT NULL,
  "scheduledAt"   TIMESTAMP(3)   NOT NULL,
  "durationMins"  INTEGER        NOT NULL,
  "status"        "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "meetingUrl"    TEXT,
  "studentNote"   TEXT,
  "mentorNote"    TEXT,
  "amountInPaise" INTEGER        NOT NULL,
  "createdAt"     TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MentorBooking_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MentorBooking_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "MentorBooking_mentorId_fkey"
    FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id"),
  CONSTRAINT "MentorBooking_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "MentorSession"("id")
);
CREATE INDEX IF NOT EXISTS "MentorBooking_studentId_idx"   ON "MentorBooking"("studentId");
CREATE INDEX IF NOT EXISTS "MentorBooking_mentorId_idx"    ON "MentorBooking"("mentorId");
CREATE INDEX IF NOT EXISTS "MentorBooking_scheduledAt_idx" ON "MentorBooking"("scheduledAt");
CREATE INDEX IF NOT EXISTS "MentorBooking_status_idx"      ON "MentorBooking"("status");

-- MentorPayment
CREATE TABLE IF NOT EXISTS "MentorPayment" (
  "id"                  TEXT           NOT NULL DEFAULT gen_random_uuid()::text,
  "bookingId"           TEXT           NOT NULL,
  "razorpayOrderId"     TEXT           NOT NULL,
  "razorpayPaymentId"   TEXT,
  "razorpaySignature"   TEXT,
  "amountInPaise"       INTEGER        NOT NULL,
  "currency"            TEXT           NOT NULL DEFAULT 'INR',
  "status"              "PaymentStatus" NOT NULL DEFAULT 'CREATED',
  "webhookPayload"      TEXT,
  "createdAt"           TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MentorPayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MentorPayment_bookingId_key"        UNIQUE ("bookingId"),
  CONSTRAINT "MentorPayment_razorpayOrderId_key"  UNIQUE ("razorpayOrderId"),
  CONSTRAINT "MentorPayment_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "MentorBooking"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "MentorPayment_razorpayOrderId_idx" ON "MentorPayment"("razorpayOrderId");
CREATE INDEX IF NOT EXISTS "MentorPayment_status_idx"           ON "MentorPayment"("status");

-- MentorReview
CREATE TABLE IF NOT EXISTS "MentorReview" (
  "id"        TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT         NOT NULL,
  "studentId" TEXT         NOT NULL,
  "mentorId"  TEXT         NOT NULL,
  "rating"    INTEGER      NOT NULL,
  "comment"   TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MentorReview_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "MentorReview_bookingId_key" UNIQUE ("bookingId"),
  CONSTRAINT "MentorReview_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "MentorBooking"("id") ON DELETE CASCADE,
  CONSTRAINT "MentorReview_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "User"("id"),
  CONSTRAINT "MentorReview_mentorId_fkey"
    FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id")
);
CREATE INDEX IF NOT EXISTS "MentorReview_mentorId_idx"  ON "MentorReview"("mentorId");
CREATE INDEX IF NOT EXISTS "MentorReview_studentId_idx" ON "MentorReview"("studentId");

-- Trigger helper (reuse if already exists from catalog migration)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW."updatedAt" = CURRENT_TIMESTAMP; RETURN NEW; END;
$$ language 'plpgsql';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'MentorProfile_updatedAt') THEN
    CREATE TRIGGER "MentorProfile_updatedAt" BEFORE UPDATE ON "MentorProfile"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'MentorExam_updatedAt') THEN
    CREATE TRIGGER "MentorExam_updatedAt" BEFORE UPDATE ON "MentorExam"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'MentorAchievement_updatedAt') THEN
    CREATE TRIGGER "MentorAchievement_updatedAt" BEFORE UPDATE ON "MentorAchievement"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'MentorSession_updatedAt') THEN
    CREATE TRIGGER "MentorSession_updatedAt" BEFORE UPDATE ON "MentorSession"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'MentorAvailability_updatedAt') THEN
    CREATE TRIGGER "MentorAvailability_updatedAt" BEFORE UPDATE ON "MentorAvailability"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'MentorBooking_updatedAt') THEN
    CREATE TRIGGER "MentorBooking_updatedAt" BEFORE UPDATE ON "MentorBooking"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'MentorPayment_updatedAt') THEN
    CREATE TRIGGER "MentorPayment_updatedAt" BEFORE UPDATE ON "MentorPayment"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'MentorReview_updatedAt') THEN
    CREATE TRIGGER "MentorReview_updatedAt" BEFORE UPDATE ON "MentorReview"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); END IF; END $$;
