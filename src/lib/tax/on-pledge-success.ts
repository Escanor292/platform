import { prisma } from "@/lib/prisma";
import { grantDigitalWarehouseItem } from "@/lib/digital-warehouse";
import { createBackerInvoice } from "@/lib/invoice-generator";
import { estimatePlatformFee } from "@/lib/tax/money-flow";
import { issueTaxDocumentForPledge, sendCertificateEmail } from "@/lib/tax/certificate";

/**
 * Gọi sau khi pledge đã SUCCESS. Idempotent.
 * - Ước tính phí sàn trên sổ Creator (không cộng vào giá backer)
 * - Cấp chứng nhận (không quà) hoặc biên lai (giao ngay)
 * - Gửi email nếu có địa chỉ
 * - Đưa tài sản số vào kho đồ
 */
export async function onPledgeSuccess(pledgeId: string) {
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
    include: {
      campaigns: { select: { feeRate: true } },
    },
  });

  if (!pledge || pledge.status !== "SUCCESS") {
    return { ok: false as const, reason: "not-success" as const };
  }

  const gross = Number(pledge.amount);
  const estimatedFee = estimatePlatformFee(gross, pledge.campaigns?.feeRate ?? 0.08);
  if (Number(pledge.platformFee) === 0 && estimatedFee > 0) {
    await prisma.pledges.update({
      where: { id: pledge.id },
      data: { platformFee: estimatedFee, updatedAt: new Date() },
    });
  }

  const tax = await issueTaxDocumentForPledge(pledge.id);
  if (tax.issued && tax.created && tax.certificate.guestEmail) {
    await sendCertificateEmail(tax.certificate.code);
  }

  if (tax.issued && tax.certificate.documentKind === "RECEIPT") {
    try {
      await createBackerInvoice(pledge.id);
    } catch (error) {
      console.error("[TAX] backer receipt failed", error);
    }
  }

  await grantDigitalWarehouseItem(pledge.id);

  return { ok: true as const, tax };
}
