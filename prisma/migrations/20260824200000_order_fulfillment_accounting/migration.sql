-- Add order/fulfillment lifecycle without deleting or rewriting pledge history.

CREATE TYPE "RewardFulfillmentType" AS ENUM ('PHYSICAL', 'EMAIL', 'DOWNLOAD', 'LICENSE_KEY', 'DIGITAL_COMIC');
CREATE TYPE "FulfillmentStatus" AS ENUM ('NOT_APPLICABLE', 'AWAITING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'DELIVERY_FAILED', 'CANCELED', 'RETURN_REQUESTED', 'RETURNED');
CREATE TYPE "DigitalAssetStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'DELIVERED', 'CLAIMED', 'REVOKED');

ALTER TABLE "campaigns"
  ADD COLUMN "closedAmount" DECIMAL(65,30),
  ADD COLUMN "closedAt" TIMESTAMP(3);

ALTER TABLE "rewards"
  ADD COLUMN "fulfillmentType" "RewardFulfillmentType" NOT NULL DEFAULT 'PHYSICAL';

ALTER TABLE "pledges"
  ALTER COLUMN "campaignId" DROP NOT NULL;

ALTER TABLE "pledges"
  ADD COLUMN "stockReserved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "fulfillmentType" "RewardFulfillmentType",
  ADD COLUMN "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
  ADD COLUMN "shippingMethod" TEXT,
  ADD COLUMN "shippingFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
  ADD COLUMN "shippingProvider" TEXT,
  ADD COLUMN "trackingNumber" TEXT,
  ADD COLUMN "deliveryFailureReason" TEXT,
  ADD COLUMN "cancellationReason" TEXT,
  ADD COLUMN "returnReason" TEXT,
  ADD COLUMN "accountingReversedAt" TIMESTAMP(3);

CREATE TABLE "reward_digital_assets" (
  "id" TEXT NOT NULL,
  "rewardId" TEXT NOT NULL,
  "campaignId" TEXT,
  "pledgeId" TEXT,
  "assetType" "RewardFulfillmentType" NOT NULL,
  "encryptedValue" TEXT,
  "assetUrl" TEXT,
  "deliveryEmail" TEXT,
  "status" "DigitalAssetStatus" NOT NULL DEFAULT 'AVAILABLE',
  "deliveredAt" TIMESTAMP(3),
  "claimedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reward_digital_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reward_digital_assets_pledgeId_key" ON "reward_digital_assets"("pledgeId");
CREATE INDEX "reward_digital_assets_rewardId_status_idx" ON "reward_digital_assets"("rewardId", "status");
CREATE INDEX "reward_digital_assets_campaignId_status_idx" ON "reward_digital_assets"("campaignId", "status");

ALTER TABLE "reward_digital_assets"
  ADD CONSTRAINT "reward_digital_assets_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "reward_digital_assets_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "reward_digital_assets_pledgeId_fkey" FOREIGN KEY ("pledgeId") REFERENCES "pledges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
