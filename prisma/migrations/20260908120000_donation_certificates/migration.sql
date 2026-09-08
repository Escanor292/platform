-- Chứng nhận ủng hộ / biên lai thanh toán (không phải hóa đơn GTGT)

CREATE TYPE "MoneyFlowType" AS ENUM ('NO_GIFT', 'GIFT_NOW', 'PREORDER');
CREATE TYPE "TaxDocumentKind" AS ENUM ('CERTIFICATE', 'RECEIPT');
CREATE TYPE "CertificateStatus" AS ENUM ('ISSUED', 'CLAIMED', 'REVOKED');

CREATE TABLE "donation_certificates" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "pledgeId" TEXT NOT NULL,
  "campaignId" TEXT,
  "creatorId" TEXT,
  "backerUserId" TEXT,
  "guestEmail" TEXT,
  "displayName" TEXT NOT NULL,
  "amount" DECIMAL(65,30) NOT NULL,
  "flowType" "MoneyFlowType" NOT NULL,
  "documentKind" "TaxDocumentKind" NOT NULL,
  "status" "CertificateStatus" NOT NULL DEFAULT 'ISSUED',
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "emailSentAt" TIMESTAMP(3),
  "claimedAt" TIMESTAMP(3),
  "claimedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "donation_certificates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "donation_certificates_code_key" ON "donation_certificates"("code");
CREATE UNIQUE INDEX "donation_certificates_pledgeId_key" ON "donation_certificates"("pledgeId");
CREATE INDEX "donation_certificates_guestEmail_idx" ON "donation_certificates"("guestEmail");
CREATE INDEX "donation_certificates_backerUserId_status_idx" ON "donation_certificates"("backerUserId", "status");
CREATE INDEX "donation_certificates_creatorId_flowType_idx" ON "donation_certificates"("creatorId", "flowType");
CREATE INDEX "donation_certificates_campaignId_idx" ON "donation_certificates"("campaignId");

ALTER TABLE "donation_certificates"
  ADD CONSTRAINT "donation_certificates_pledgeId_fkey"
  FOREIGN KEY ("pledgeId") REFERENCES "pledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donation_certificates"
  ADD CONSTRAINT "donation_certificates_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "donation_certificates"
  ADD CONSTRAINT "donation_certificates_backerUserId_fkey"
  FOREIGN KEY ("backerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "donation_certificates"
  ADD CONSTRAINT "donation_certificates_claimedByUserId_fkey"
  FOREIGN KEY ("claimedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
