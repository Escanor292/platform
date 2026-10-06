-- Danh sach chien dich loc theo status + thu tu createdAt.
CREATE INDEX IF NOT EXISTS "campaigns_status_createdAt_idx" ON "campaigns"("status", "createdAt");

-- Doi soat va dem pledge theo chien dich; cron don PENDING theo createdAt.
CREATE INDEX IF NOT EXISTS "pledges_campaignId_status_idx" ON "pledges"("campaignId", "status");
CREATE INDEX IF NOT EXISTS "pledges_status_createdAt_idx" ON "pledges"("status", "createdAt");
