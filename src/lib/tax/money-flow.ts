export const MONEY_FLOW = {
  NO_GIFT: "NO_GIFT",
  GIFT_NOW: "GIFT_NOW",
  PREORDER: "PREORDER",
} as const;

export type MoneyFlow = (typeof MONEY_FLOW)[keyof typeof MONEY_FLOW];

export const TAX_DOCUMENT = {
  CERTIFICATE: "CERTIFICATE",
  RECEIPT: "RECEIPT",
} as const;

export type TaxDocumentKind = (typeof TAX_DOCUMENT)[keyof typeof TAX_DOCUMENT];

export function classifyMoneyFlow(input: {
  rewardId?: string | null;
  isPreorder?: boolean | null;
}): MoneyFlow {
  if (!input.rewardId) return MONEY_FLOW.NO_GIFT;
  if (input.isPreorder) return MONEY_FLOW.PREORDER;
  return MONEY_FLOW.GIFT_NOW;
}

export function documentKindForFlow(flow: MoneyFlow): TaxDocumentKind | null {
  if (flow === MONEY_FLOW.NO_GIFT) return TAX_DOCUMENT.CERTIFICATE;
  if (flow === MONEY_FLOW.GIFT_NOW) return TAX_DOCUMENT.RECEIPT;
  return null;
}

export function moneyFlowLabel(flow: MoneyFlow) {
  if (flow === MONEY_FLOW.NO_GIFT) return "Ủng hộ không nhận quà";
  if (flow === MONEY_FLOW.GIFT_NOW) return "Có quà — giao ngay";
  return "Có quà — đặt trước";
}

export function documentKindLabel(kind: TaxDocumentKind) {
  return kind === TAX_DOCUMENT.CERTIFICATE ? "Chứng nhận ủng hộ" : "Biên lai thanh toán";
}

/** Phí dịch vụ sàn ước tính, trừ phía Creator — không cộng vào giá người mua. */
export function estimatePlatformFee(grossAmount: number, feeRate = 0.08) {
  const safeRate = Number.isFinite(feeRate) && feeRate >= 0 && feeRate <= 0.3 ? feeRate : 0.08;
  return Math.round(Math.max(0, grossAmount) * safeRate);
}

/** GTGT trên phí dịch vụ sàn (ước tính, chưa xuất HĐ GTGT). */
export function estimateVatOnPlatformFee(platformFee: number, vatRate = 0.08) {
  const safeRate = Number.isFinite(vatRate) && vatRate >= 0 && vatRate <= 0.2 ? vatRate : 0.08;
  return Math.round(Math.max(0, platformFee) * safeRate);
}

export function creatorNetEstimate(grossAmount: number, platformFee: number) {
  return Math.max(0, Math.round(grossAmount) - Math.round(platformFee));
}

const YEARLY_CNKD_THRESHOLD = 1_000_000_000;

export function yearlyThresholdWarning(yearGross: number) {
  if (yearGross < YEARLY_CNKD_THRESHOLD) {
    return {
      overThreshold: false,
      threshold: YEARLY_CNKD_THRESHOLD,
      remaining: YEARLY_CNKD_THRESHOLD - yearGross,
    };
  }
  return {
    overThreshold: true,
    threshold: YEARLY_CNKD_THRESHOLD,
    remaining: 0,
  };
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function formatCertificateCode(issuedAt: Date, serial: string) {
  const year = issuedAt.getFullYear();
  const month = String(issuedAt.getMonth() + 1).padStart(2, "0");
  const clean = serial.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 4).padEnd(4, "X");
  return `TT-UH-${year}${month}-${clean}`;
}

export function randomCertificateSerial(bytes: Uint8Array) {
  let serial = "";
  for (let i = 0; i < 4; i += 1) {
    serial += CODE_ALPHABET[bytes[i % bytes.length] % CODE_ALPHABET.length];
  }
  return serial;
}

export function isCertificateCode(value: string) {
  return /^TT-UH-\d{6}-[A-Z0-9]{4}$/i.test(value.trim());
}

export function buildLedgerRows(input: {
  flow: MoneyFlow;
  grossAmount: number;
  tipAmount?: number;
  platformFeeRate?: number;
}) {
  const gross = Math.round(input.grossAmount);
  const tip = Math.round(input.tipAmount || 0);
  const platformFee = estimatePlatformFee(gross, input.platformFeeRate);
  const vatOnFee = estimateVatOnPlatformFee(platformFee);
  const creatorNet = input.flow === MONEY_FLOW.NO_GIFT
    ? creatorNetEstimate(gross, platformFee)
    : creatorNetEstimate(gross, platformFee);

  return {
    flow: input.flow,
    backer: {
      paid: gross + tip,
      listedPrice: gross,
      vatOnProduct: 0,
      note: "Người mua trả giá niêm yết. Không cộng dòng VAT trên checkout.",
    },
    creator: {
      gross,
      platformFee,
      netEstimate: creatorNet,
      withholding: 0,
      note: "Sàn chưa khấu trừ GTGT/TNCN hộ. Creator tự kê khai khi đủ điều kiện.",
    },
    platform: {
      tip,
      serviceFeeEstimate: platformFee,
      vatOnServiceFeeEstimate: vatOnFee,
      note: "Phí dịch vụ và GTGT trên phí là ước tính sổ sách, chưa xuất HĐ GTGT.",
    },
  };
}
