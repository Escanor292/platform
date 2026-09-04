-- Banned-word entries reuse blacklist; project lock is reversible.
ALTER TYPE "BlacklistType" ADD VALUE IF NOT EXISTS 'WORD';

ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "isLocked" BOOLEAN NOT NULL DEFAULT false;
