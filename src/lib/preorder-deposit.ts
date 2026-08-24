export const DEFAULT_ONLINE_DEPOSIT_PERCENT = 30;
export const DEFAULT_COD_DEPOSIT_PERCENT = 50;

export function normalizeDepositPercent(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 99) return fallback;
  return parsed;
}

export function calculateDepositAmount(baseAmount: number, percent: number): number {
  return Math.max(0, Math.round(baseAmount * percent / 100));
}

export function calculateCancellationSettlement(
  paidAmount: number,
  orderValue: number,
  forfeiturePercent: number,
) {
  const cancellationFeeAmount = Math.min(
    Math.max(0, paidAmount),
    calculateDepositAmount(orderValue, forfeiturePercent),
  );
  const refundAmount = Math.max(0, paidAmount - cancellationFeeAmount);
  return { cancellationFeeAmount, refundAmount };
}
