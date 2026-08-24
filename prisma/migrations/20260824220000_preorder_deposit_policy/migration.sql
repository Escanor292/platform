-- Creator-configurable preorder deposits.
ALTER TABLE "rewards"
  ADD COLUMN "onlineDepositPercent" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "codDepositPercent" INTEGER NOT NULL DEFAULT 50;

ALTER TABLE "rewards"
  ADD CONSTRAINT "rewards_onlineDepositPercent_check"
    CHECK ("onlineDepositPercent" BETWEEN 1 AND 99),
  ADD CONSTRAINT "rewards_codDepositPercent_check"
    CHECK ("codDepositPercent" BETWEEN 1 AND 99);

-- Separate the product value, amount paid now, amount retained after cancellation,
-- and amount used for live campaign accounting.
ALTER TABLE "pledges"
  ADD COLUMN "depositAmount" DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN "chargeAmount" DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN "orderTotalAmount" DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN "remainingAmount" DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN "paidAmount" DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN "accountingAmount" DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN "refundAmount" DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN "cancellationFeeAmount" DECIMAL NOT NULL DEFAULT 0;

-- Preserve the existing campaign totals for historical successful pledges.
UPDATE "pledges"
SET
  "accountingAmount" = CASE WHEN "status" = 'SUCCESS' THEN "amount" ELSE 0 END,
  "paidAmount" = CASE WHEN "status" = 'SUCCESS' THEN "totalAmount" ELSE 0 END,
  "chargeAmount" = CASE WHEN "status" = 'SUCCESS' THEN "totalAmount" ELSE 0 END,
  "orderTotalAmount" = "totalAmount";

ALTER TABLE "pledges"
  ADD CONSTRAINT "pledges_amounts_nonnegative_check"
    CHECK (
      "depositAmount" >= 0 AND
      "chargeAmount" >= 0 AND
      "orderTotalAmount" >= 0 AND
      "remainingAmount" >= 0 AND
      "paidAmount" >= 0 AND
      "accountingAmount" >= 0 AND
      "refundAmount" >= 0 AND
      "cancellationFeeAmount" >= 0
    );
