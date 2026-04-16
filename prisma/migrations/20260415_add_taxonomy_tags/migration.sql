-- Add tags field to campaigns table for taxonomy system
ALTER TABLE "campaigns" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create indexes for better query performance
CREATE INDEX "campaigns_category_idx" ON "campaigns"("category");
CREATE INDEX "campaigns_tags_idx" ON "campaigns" USING GIN ("tags");

-- Add comment for documentation
COMMENT ON COLUMN "campaigns"."tags" IS 'Starter tags for campaign taxonomy (max 5 tags)';
COMMENT ON COLUMN "campaigns"."category" IS 'Main category from taxonomy system (one of 10 categories)';
