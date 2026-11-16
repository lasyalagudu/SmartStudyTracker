-- Creates the three catalog tables for the scalable exam template architecture.
-- Run with: node scripts/apply-catalog-tables.js
-- Safe to re-run — all statements use IF NOT EXISTS.

-- ExamCatalog
CREATE TABLE IF NOT EXISTS "ExamCatalog" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "slug"        TEXT NOT NULL,
    "label"       TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "icon"        TEXT NOT NULL DEFAULT '📚',
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "totalHours"  INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExamCatalog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ExamCatalog_slug_key"     ON "ExamCatalog"("slug");
CREATE INDEX        IF NOT EXISTS "ExamCatalog_slug_idx"     ON "ExamCatalog"("slug");
CREATE INDEX        IF NOT EXISTS "ExamCatalog_isActive_idx" ON "ExamCatalog"("isActive");

-- CatalogSubject
CREATE TABLE IF NOT EXISTS "CatalogSubject" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "examId"    TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "color"     TEXT NOT NULL DEFAULT '#7C3AED',
    "order"     INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CatalogSubject_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CatalogSubject_examId_fkey"
        FOREIGN KEY ("examId") REFERENCES "ExamCatalog"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "CatalogSubject_examId_idx" ON "CatalogSubject"("examId");

-- CatalogTopic
CREATE TABLE IF NOT EXISTS "CatalogTopic" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "subjectId"      TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "order"          INTEGER NOT NULL DEFAULT 0,
    "estimatedHours" INTEGER NOT NULL DEFAULT 1,
    "priority"       TEXT NOT NULL DEFAULT 'MEDIUM',
    "difficulty"     TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CatalogTopic_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CatalogTopic_subjectId_fkey"
        FOREIGN KEY ("subjectId") REFERENCES "CatalogSubject"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "CatalogTopic_subjectId_idx" ON "CatalogTopic"("subjectId");
CREATE INDEX IF NOT EXISTS "CatalogTopic_priority_idx"  ON "CatalogTopic"("priority");
