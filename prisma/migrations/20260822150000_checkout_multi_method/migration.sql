-- CreateEnum
CREATE TYPE "RewardAvailability" AS ENUM ('AVAILABLE', 'DEVELOPMENT');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CARD', 'BANK_ACCOUNT', 'MOMO', 'ZALOPAY');

-- CreateEnum
CREATE TYPE "PaymentMethodStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "pledges" ADD COLUMN     "isCashOnDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "rewards" ADD COLUMN     "availability" "RewardAvailability" NOT NULL DEFAULT 'AVAILABLE';

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "methodType" "PaymentMethodType" NOT NULL,
    "label" TEXT NOT NULL,
    "brand" TEXT,
    "last4" TEXT,
    "providerMethodRef" TEXT,
    "status" "PaymentMethodStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "campaignId" TEXT NOT NULL,
    "rewardId" TEXT,
    "payload" JSONB NOT NULL,
    "returnPath" TEXT NOT NULL,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_methods_userId_status_idx" ON "payment_methods"("userId", "status");

-- CreateIndex
CREATE INDEX "payment_methods_provider_providerMethodRef_idx" ON "payment_methods"("provider", "providerMethodRef");

-- CreateIndex
CREATE INDEX "checkout_sessions_userId_status_idx" ON "checkout_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "checkout_sessions_expiresAt_status_idx" ON "checkout_sessions"("expiresAt", "status");

-- CreateIndex
CREATE INDEX "checkout_sessions_campaignId_rewardId_idx" ON "checkout_sessions"("campaignId", "rewardId");

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
