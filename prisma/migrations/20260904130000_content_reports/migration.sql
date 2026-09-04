CREATE TYPE "ReportTargetType" AS ENUM ('CAMPAIGN', 'PROJECT', 'PRODUCT', 'BLOG', 'PROFILE');

ALTER TABLE "campaign_reports"
  ADD COLUMN IF NOT EXISTS "targetType" "ReportTargetType" NOT NULL DEFAULT 'CAMPAIGN',
  ADD COLUMN IF NOT EXISTS "targetId" TEXT,
  ADD COLUMN IF NOT EXISTS "targetTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "targetHref" TEXT;

UPDATE "campaign_reports" AS r
SET
  "targetId" = r."campaignId",
  "targetTitle" = c."title",
  "targetHref" = '/campaigns/' || c."slug"
FROM "campaigns" AS c
WHERE c."id" = r."campaignId";

UPDATE "campaign_reports"
SET "targetId" = COALESCE("targetId", "campaignId")
WHERE "targetId" IS NULL;

ALTER TABLE "campaign_reports"
  ALTER COLUMN "targetId" SET NOT NULL,
  ALTER COLUMN "campaignId" DROP NOT NULL;

DROP INDEX IF EXISTS "campaign_reports_campaignId_userId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "campaign_reports_targetType_targetId_userId_key"
  ON "campaign_reports"("targetType", "targetId", "userId");
CREATE INDEX IF NOT EXISTS "campaign_reports_targetType_targetId_idx"
  ON "campaign_reports"("targetType", "targetId");
