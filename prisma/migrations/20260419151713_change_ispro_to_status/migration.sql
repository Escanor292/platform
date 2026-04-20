/*
  Warnings:

  - The values [CREATOR_PRO] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isPro` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('NORMAL', 'PRO', 'BANNED');

-- AlterTable: Add status column first with default NORMAL
ALTER TABLE "users" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'NORMAL';

-- Migrate data: Convert CREATOR_PRO role to CREATOR with PRO status
UPDATE "users" SET "role" = 'CREATOR', "status" = 'PRO' WHERE "role" = 'CREATOR_PRO';

-- Migrate data: Convert isPro=true to status=PRO
UPDATE "users" SET "status" = 'PRO' WHERE "isPro" = true;

-- AlterEnum: Remove CREATOR_PRO from UserRole
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'BACKER', 'CREATOR_PENDING', 'CREATOR');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'BACKER';
COMMIT;

-- AlterTable: Drop isPro column
ALTER TABLE "users" DROP COLUMN "isPro";
