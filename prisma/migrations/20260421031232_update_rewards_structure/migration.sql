/*
  Warnings:

  - You are about to drop the column `amount` on the `rewards` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `rewards` table. All the data in the column will be lost.
  - You are about to drop the column `remaining` on the `rewards` table. All the data in the column will be lost.
  - Added the required column `minAmount` to the `rewards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `rewards` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "rewards" DROP CONSTRAINT "rewards_campaignId_fkey";

-- AlterTable
ALTER TABLE "pledges" ADD COLUMN     "rewardId" TEXT;

-- AlterTable
ALTER TABLE "rewards" DROP COLUMN "amount",
DROP COLUMN "quantity",
DROP COLUMN "remaining",
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxQuantity" INTEGER,
ADD COLUMN     "minAmount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "rewards_campaignId_idx" ON "rewards"("campaignId");

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
