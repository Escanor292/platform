-- Add hero background (image or multi-color gradient) support to projects
ALTER TABLE "projects" ADD COLUMN "heroBackgroundType" VARCHAR(16) NOT NULL DEFAULT 'image';
ALTER TABLE "projects" ADD COLUMN "heroBackgroundConfig" JSONB;
