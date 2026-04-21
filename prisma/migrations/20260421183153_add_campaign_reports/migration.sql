-- CreateEnum
CREATE TYPE "CampaignReportReason" AS ENUM ('FRAUD', 'INAPPROPRIATE', 'MISLEADING', 'SCAM', 'INTELLECTUAL_PROPERTY', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "campaign_reports" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "CampaignReportReason" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_reports_campaignId_idx" ON "campaign_reports"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_reports_userId_idx" ON "campaign_reports"("userId");

-- CreateIndex
CREATE INDEX "campaign_reports_status_idx" ON "campaign_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_reports_campaignId_userId_key" ON "campaign_reports"("campaignId", "userId");

-- AddForeignKey
ALTER TABLE "campaign_reports" ADD CONSTRAINT "campaign_reports_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_reports" ADD CONSTRAINT "campaign_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
