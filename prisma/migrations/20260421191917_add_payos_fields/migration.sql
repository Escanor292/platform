/*
  Warnings:

  - A unique constraint covering the columns `[payosOrderCode]` on the table `pledges` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "pledges" ADD COLUMN     "payosOrderCode" TEXT,
ADD COLUMN     "webhookProcessedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "pledges_payosOrderCode_key" ON "pledges"("payosOrderCode");
