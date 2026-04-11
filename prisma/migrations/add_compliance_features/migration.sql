-- CreateEnum
CREATE TYPE "IDCardType" AS ENUM ('CMND', 'CCCD', 'PASSPORT');
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'REFUND', 'APPROVE', 'REJECT', 'CANCEL', 'LOGIN', 'LOGOUT', 'KYC_SUBMIT', 'KYC_APPROVE', 'KYC_REJECT');
CREATE TYPE "BlacklistType" AS ENUM ('IP', 'EMAIL', 'PHONE', 'BANK_ACCOUNT', 'DEVICE_ID');

-- CreateTable KYCInfo
CREATE TABLE "kyc_info" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "idCardNumber" TEXT NOT NULL,
    "idCardType" "IDCardType" NOT NULL,
    "idCardFrontImage" TEXT,
    "idCardBackImage" TEXT,
    "idCardIssueDate" TIMESTAMP(3),
    "idCardIssuePlace" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "placeOfBirth" TEXT,
    "nationality" TEXT NOT NULL DEFAULT 'VN',
    "permanentAddress" TEXT,
    "currentAddress" TEXT,
    "occupation" TEXT,
    "monthlyIncome" TEXT,
    "verificationStatus" "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "rejectedReason" TEXT,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable BackerInvoice
CREATE TABLE "backer_invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "pledgeId" TEXT NOT NULL,
    "backerName" TEXT NOT NULL,
    "backerEmail" TEXT,
    "backerPhone" TEXT,
    "backerAddress" TEXT,
    "backerTaxCode" TEXT,
    "companyName" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "tipAmount" DECIMAL(65,30) NOT NULL,
    "platformFee" DECIMAL(65,30) NOT NULL,
    "vatAmount" DECIMAL(65,30) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "campaignTitle" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backer_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable AuditLog
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable TransactionLimit
CREATE TABLE "transaction_limits" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "kycStatus" "KYCStatus",
    "maxPerTransaction" DECIMAL(65,30) NOT NULL,
    "maxPerDay" DECIMAL(65,30) NOT NULL,
    "maxPerMonth" DECIMAL(65,30) NOT NULL,
    "maxTransactionsPerDay" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable Blacklist
CREATE TABLE "blacklist" (
    "id" TEXT NOT NULL,
    "type" "BlacklistType" NOT NULL,
    "value" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "addedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kyc_info_userId_key" ON "kyc_info"("userId");
CREATE UNIQUE INDEX "kyc_info_idCardNumber_key" ON "kyc_info"("idCardNumber");
CREATE UNIQUE INDEX "backer_invoices_invoiceNumber_key" ON "backer_invoices"("invoiceNumber");
CREATE UNIQUE INDEX "backer_invoices_pledgeId_key" ON "backer_invoices"("pledgeId");
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE UNIQUE INDEX "transaction_limits_userId_key" ON "transaction_limits"("userId");
CREATE UNIQUE INDEX "blacklist_type_value_key" ON "blacklist"("type", "value");
CREATE INDEX "blacklist_type_value_isActive_idx" ON "blacklist"("type", "value", "isActive");

-- AddForeignKey
ALTER TABLE "kyc_info" ADD CONSTRAINT "kyc_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "backer_invoices" ADD CONSTRAINT "backer_invoices_pledgeId_fkey" FOREIGN KEY ("pledgeId") REFERENCES "pledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
