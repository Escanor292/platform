DO $$ BEGIN
  CREATE TYPE "FundingModel" AS ENUM ('ALL_OR_NOTHING', 'KEEP_IT_ALL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "fundingModel" "FundingModel" NOT NULL DEFAULT 'ALL_OR_NOTHING';

CREATE INDEX IF NOT EXISTS "campaigns_isFeatured_idx" ON "campaigns"("isFeatured");
CREATE INDEX IF NOT EXISTS "campaigns_fundingModel_idx" ON "campaigns"("fundingModel");
