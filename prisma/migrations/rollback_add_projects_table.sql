-- MANUAL ROLLBACK ONLY: apply on an isolated maintenance window after a verified backup.
-- Prisma Migrate does not execute rollback files automatically.

ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS "blog_posts_projectId_fkey";
ALTER TABLE "campaigns" DROP CONSTRAINT IF EXISTS "campaigns_projectId_fkey";
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_creatorId_fkey";

DROP INDEX IF EXISTS "blog_posts_projectId_idx";
DROP INDEX IF EXISTS "campaigns_projectId_idx";
DROP INDEX IF EXISTS "projects_creatorId_idx";

ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "projectId";
ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "projectId";
DROP TABLE IF EXISTS "projects";
