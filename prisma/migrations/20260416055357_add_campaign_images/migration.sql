-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
