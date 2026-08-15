-- Rollback migration for add_projects_table
-- This script removes the project hierarchy tables and relationships

-- Remove foreign key constraints first
ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS "blog_posts_projectId_fkey";
ALTER TABLE "campaigns" DROP CONSTRAINT IF EXISTS "campaigns_projectId_fkey";
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_creatorId_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "blog_posts_projectId_idx";
DROP INDEX IF EXISTS "campaigns_projectId_idx";
DROP INDEX IF EXISTS "projects_creatorId_idx";

-- Remove projectId columns
ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "projectId";
ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "projectId";

-- Drop projects table
DROP TABLE IF EXISTS "projects";
