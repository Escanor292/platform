-- CreateEnum
CREATE TYPE "PledgeKind" AS ENUM ('ONE_TIME', 'MEMBERSHIP');
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');
CREATE TYPE "CredentialSubject" AS ENUM ('INDIVIDUAL', 'ORGANIZATION');
CREATE TYPE "CredentialKind" AS ENUM ('DEGREE', 'CERTIFICATE', 'BUSINESS_LICENSE', 'TAX_REGISTRATION');
CREATE TYPE "CredentialStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "pledges" ADD COLUMN "pledgeKind" "PledgeKind" NOT NULL DEFAULT 'ONE_TIME';
ALTER TABLE "pledges" ADD COLUMN "tierId" TEXT;
ALTER TABLE "pledges" ADD COLUMN "membershipId" TEXT;
ALTER TABLE "pledges" ADD COLUMN "periodStart" TIMESTAMP(3);
ALTER TABLE "pledges" ADD COLUMN "periodEnd" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "support_tiers" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "support_tiers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "supporterId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodEnd" TIMESTAMP(3),
    "lastReminderAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectType" "CredentialSubject" NOT NULL,
    "kind" "CredentialKind" NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "credentialCode" TEXT,
    "fileUrl" TEXT NOT NULL,
    "status" "CredentialStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_tiers_creatorId_isActive_idx" ON "support_tiers"("creatorId", "isActive");
CREATE UNIQUE INDEX "memberships_supporterId_creatorId_key" ON "memberships"("supporterId", "creatorId");
CREATE INDEX "memberships_creatorId_status_idx" ON "memberships"("creatorId", "status");
CREATE INDEX "memberships_status_currentPeriodEnd_idx" ON "memberships"("status", "currentPeriodEnd");
CREATE INDEX "credentials_userId_status_idx" ON "credentials"("userId", "status");
CREATE INDEX "credentials_status_createdAt_idx" ON "credentials"("status", "createdAt");
CREATE INDEX "pledges_tierId_idx" ON "pledges"("tierId");
CREATE INDEX "pledges_membershipId_idx" ON "pledges"("membershipId");

-- AddForeignKey
ALTER TABLE "support_tiers" ADD CONSTRAINT "support_tiers_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_supporterId_fkey" FOREIGN KEY ("supporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "support_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "support_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;
