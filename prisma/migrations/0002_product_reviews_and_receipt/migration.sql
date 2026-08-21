-- Add receipt confirmation to successful reward pledges
ALTER TABLE "pledges"
ADD COLUMN "receivedAt" TIMESTAMP(3);

-- Product reviews are tied to a specific successful pledge so each purchase can review once.
CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "pledgeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_reviews_pledgeId_key" ON "product_reviews"("pledgeId");
CREATE INDEX "product_reviews_rewardId_createdAt_idx" ON "product_reviews"("rewardId", "createdAt");
CREATE INDEX "product_reviews_userId_idx" ON "product_reviews"("userId");

ALTER TABLE "product_reviews"
ADD CONSTRAINT "product_reviews_rewardId_fkey"
FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_reviews"
ADD CONSTRAINT "product_reviews_pledgeId_fkey"
FOREIGN KEY ("pledgeId") REFERENCES "pledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_reviews"
ADD CONSTRAINT "product_reviews_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
