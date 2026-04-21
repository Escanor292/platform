-- CreateTable
CREATE TABLE "campaign_followers" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_followers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_followers_campaignId_idx" ON "campaign_followers"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_followers_userId_idx" ON "campaign_followers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_followers_campaignId_userId_key" ON "campaign_followers"("campaignId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_followers_campaignId_email_key" ON "campaign_followers"("campaignId", "email");

-- AddForeignKey
ALTER TABLE "campaign_followers" ADD CONSTRAINT "campaign_followers_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_followers" ADD CONSTRAINT "campaign_followers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
