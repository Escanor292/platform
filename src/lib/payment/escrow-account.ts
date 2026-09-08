/**
 * Tài khoản ngân hàng trung gian giữ hộ.
 * Backer chuyển vào đây. Creator không kết nối PayOS/MoMo/VNPay.
 * Khi chiến dịch kết thúc: đạt goal → chi hộ về STK creator; không đạt → hoàn backer.
 */
export type EscrowBankAccount = {
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
};

export function getEscrowBankAccount(): EscrowBankAccount {
  return {
    bankName: process.env.ESCROW_BANK_NAME || "Vietcombank",
    bankBin: process.env.ESCROW_BANK_BIN || "970436",
    accountNumber: process.env.ESCROW_ACCOUNT_NUMBER || "0123456789",
    accountHolder: process.env.ESCROW_ACCOUNT_HOLDER || "CONG TY TUTE FUND",
    branch: process.env.ESCROW_BANK_BRANCH || undefined,
  };
}

export function buildTransferContent(pledgeId: string) {
  const compact = pledgeId.replace(/-/g, "").slice(0, 10).toUpperCase();
  return `TUTE ${compact}`;
}

export function buildVietQrImageUrl(params: {
  amount: number;
  addInfo: string;
  account?: EscrowBankAccount;
}) {
  const account = params.account || getEscrowBankAccount();
  const info = encodeURIComponent(params.addInfo);
  return `https://img.vietqr.io/image/${account.bankBin}-${account.accountNumber}-compact2.png?amount=${Math.round(params.amount)}&addInfo=${info}&accountName=${encodeURIComponent(account.accountHolder)}`;
}
