import {
  buildLedgerRows,
  classifyMoneyFlow,
  documentKindForFlow,
  estimatePlatformFee,
  estimateVatOnPlatformFee,
  formatCertificateCode,
  isCertificateCode,
  MONEY_FLOW,
  TAX_DOCUMENT,
  yearlyThresholdWarning,
} from "@/lib/tax/money-flow";

describe("money flow taxonomy", () => {
  it("maps no reward to ủng hộ không quà", () => {
    expect(classifyMoneyFlow({ rewardId: null })).toBe(MONEY_FLOW.NO_GIFT);
    expect(documentKindForFlow(MONEY_FLOW.NO_GIFT)).toBe(TAX_DOCUMENT.CERTIFICATE);
  });

  it("maps ready stock reward to giao ngay", () => {
    expect(classifyMoneyFlow({ rewardId: "r1", isPreorder: false })).toBe(MONEY_FLOW.GIFT_NOW);
    expect(documentKindForFlow(MONEY_FLOW.GIFT_NOW)).toBe(TAX_DOCUMENT.RECEIPT);
  });

  it("does not auto-issue tax docs for preorder", () => {
    expect(classifyMoneyFlow({ rewardId: "r1", isPreorder: true })).toBe(MONEY_FLOW.PREORDER);
    expect(documentKindForFlow(MONEY_FLOW.PREORDER)).toBeNull();
  });
});

describe("certificate codes", () => {
  it("formats TT-UH-YYYYMM-XXXX", () => {
    expect(formatCertificateCode(new Date(2026, 8, 8), "ab12")).toBe("TT-UH-202609-AB12");
    expect(isCertificateCode("TT-UH-202609-AB12")).toBe(true);
    expect(isCertificateCode("INV-20260908-XXXXX")).toBe(false);
  });
});

describe("shopee-style ledgers", () => {
  it("does not add VAT onto the backer checkout price", () => {
    const rows = buildLedgerRows({ flow: MONEY_FLOW.GIFT_NOW, grossAmount: 100000, tipAmount: 0, platformFeeRate: 0.08 });
    expect(rows.backer.paid).toBe(100000);
    expect(rows.backer.vatOnProduct).toBe(0);
    expect(rows.creator.platformFee).toBe(8000);
    expect(rows.creator.netEstimate).toBe(92000);
    expect(rows.creator.withholding).toBe(0);
    expect(rows.platform.vatOnServiceFeeEstimate).toBe(640);
  });

  it("rounds platform fee and vat like integer VND", () => {
    expect(estimatePlatformFee(99000, 0.08)).toBe(7920);
    expect(estimateVatOnPlatformFee(7920, 0.08)).toBe(634);
  });

  it("flags the 1 billion CNKD threshold", () => {
    expect(yearlyThresholdWarning(999_999_999).overThreshold).toBe(false);
    expect(yearlyThresholdWarning(1_000_000_000).overThreshold).toBe(true);
  });
});
