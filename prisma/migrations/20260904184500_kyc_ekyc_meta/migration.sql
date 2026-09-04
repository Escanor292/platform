-- eKYC metadata on existing kyc_info (no new table)
ALTER TABLE "kyc_info" ADD COLUMN IF NOT EXISTS "selfieImage" TEXT;
ALTER TABLE "kyc_info" ADD COLUMN IF NOT EXISTS "consentAt" TIMESTAMP(3);
ALTER TABLE "kyc_info" ADD COLUMN IF NOT EXISTS "ekycMeta" JSONB;
