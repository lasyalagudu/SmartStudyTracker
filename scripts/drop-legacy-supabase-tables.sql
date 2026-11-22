-- ─────────────────────────────────────────────────────────────────────────────
-- Drop legacy Supabase Auth tables that are no longer used.
-- The app now uses Clerk for auth and Prisma-managed PascalCase tables
-- ("User", "Exam", "Subject", etc.) instead of these snake_case tables.
--
-- This fixes the P4002 "Cross schema references" error from prisma db push
-- by removing the public.profiles → auth.users foreign key.
--
-- Safe to re-run — all statements use IF EXISTS.
-- Prisma tables ("User", "Exam", etc.) are NOT affected.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Drop the trigger that inserts into profiles on new Supabase auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Drop old snake_case tables in reverse dependency order
--    (children first, then parents, then profiles last)
DROP TABLE IF EXISTS public.mistakes CASCADE;
DROP TABLE IF EXISTS public.timer_sessions CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
