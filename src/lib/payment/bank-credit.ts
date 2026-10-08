import { prisma } from "@/lib/prisma";
import { getEscrowBankAccount } from "@/lib/payment/escrow-account";
import { settlePledgeAsPaid } from "@/lib/payment/settle-pledge";

export function extractTransferCode(content: string) {
  const compact = content.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = compact.match(/TUTE[A-Z0-9]{10}/);
  return match?.[0] || null;
}

export function bankCreditAuthorized(header: string | null) {
  const expected = process.env.SEPAY_WEBHOOK_API_KEY?.trim();
  if (!expected || !header?.startsWith("Apikey ")) return false;
  const given = header.slice("Apikey ".length);
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i += 1) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function applyBankCredit(body: {
  id?: number | string;
  transferType?: string;
  transferAmount?: number | string;
  content?: string;
  accountNumber?: string;
  referenceCode?: string;
}) {
  if (String(body.transferType || "").toLowerCase() !== "in") {
    return { success: true as const, ignored: "not-incoming" as const };
  }
  const escrow = getEscrowBankAccount();
  if (body.accountNumber && escrow.accountNumber && body.accountNumber !== escrow.accountNumber) {
    return { success: true as const, ignored: "other-account" as const };
  }
  const code = extractTransferCode(String(body.content || ""));
  if (!code) return { success: true as const, ignored: "no-code" as const };

  const pledge = await prisma.pledges.findUnique({ where: { payosOrderCode: code } });
  if (!pledge) return { success: true as const, ignored: "no-pledge" as const };
  if (pledge.paymentProvider === "COD") return { success: true as const, ignored: "cod" as const };
  if (pledge.status === "SUCCESS") return { success: true as const, skipped: "already-settled" as const };
  if (pledge.status !== "PENDING") return { success: true as const, ignored: "not-pending" as const };

  const paid = Math.round(Number(body.transferAmount));
  const expected = Math.round(Number(pledge.chargeAmount || pledge.totalAmount));
  if (!Number.isFinite(paid) || paid !== expected) {
    return { success: true as const, ignored: "amount-mismatch" as const, expected, paid };
  }

  const result = await settlePledgeAsPaid(pledge.id, {
    transactionId: body.referenceCode || (body.id ? `SEPAY-${body.id}` : pledge.transactionId),
    reason: "SePay báo tiền đã vào tài khoản trung gian, khớp nội dung và số tiền",
  });
  if (!result.ok) return { success: false as const, reason: result.reason };
  return { success: true as const, pledgeId: pledge.id };
}
