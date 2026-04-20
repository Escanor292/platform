-- AlterTable
ALTER TABLE "campaign_updates" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "campaign_updates_campaignId_isPinned_idx" ON "campaign_updates"("campaignId", "isPinned");

-- CreateIndex
CREATE INDEX "campaign_updates_tags_idx" ON "campaign_updates"("tags");
