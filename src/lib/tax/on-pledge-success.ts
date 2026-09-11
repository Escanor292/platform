import { prisma } from "@/lib/prisma";
import { grantDigitalWarehouseItem } from "@/lib/digital-warehouse";
import { createBackerInvoice } from "@/lib/invoice-generator";
import { notificationService } from "@/services/mongodb/notification.service";
import { estimatePlatformFee } from "@/lib/tax/money-flow";
import { issueTaxDocumentForPledge, sendCertificateEmail } from "@/lib/tax/certificate";

/**
 * Goi sau khi pledge da SUCCESS. Idempotent.
 * - Uoc tinh phi san tren so Creator (khong cong vao gia backer)
 * - Cap chung nhan (khong qua) hoac bien lai (giao ngay)
 * - Gui email neu co dia chi
 * - Dua tai san so / chung tu vao kho do
 */
export async function onPledgeSuccess(pledgeId: string) {
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
    include: {
      campaigns: { select: { feeRate: true, title: true } },
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

  let tax: Awaited<ReturnType<typeof issueTaxDocumentForPledge>>;
  try {
    tax = await issueTaxDocumentForPledge(pledge.id);
  } catch (error) {
    console.error("[TAX] issue failed", error);
    tax = { issued: false as const, reason: "pledge-not-success" as const };
  }

  if (tax.issued && tax.certificate.guestEmail) {
    try {
      await sendCertificateEmail(tax.certificate.code);
    } catch (error) {
      console.error("[TAX] certificate email failed", error);
    }
  }

  if (tax.issued && tax.certificate.documentKind === "RECEIPT") {
    try {
      await createBackerInvoice(pledge.id);
    } catch (error) {
      console.error("[TAX] backer receipt failed", error);
    }
  }

  if (tax.issued && pledge.userId) {
    const kindLabel = tax.certificate.documentKind === "CERTIFICATE"
      ? "Chứng nhận ủng hộ"
      : "Biên lai thanh toán";
    const campaignTitle = pledge.campaigns?.title?.trim();
    notificationService.send({
      userId: pledge.userId,
      type: "PAYMENT_SUCCESS",
      title: "Đã vào kho đồ",
      message: campaignTitle
        ? `${kindLabel} ${tax.certificate.code} · ${campaignTitle} đã vào kho đồ của bạn`
        : `${kindLabel} ${tax.certificate.code} đã vào kho đồ của bạn`,
      payload: {
        href: `/purchases?item=${encodeURIComponent(pledge.id)}`,
        pledgeId: pledge.id,
        extra: {
          certificateCode: tax.certificate.code,
          documentKind: tax.certificate.documentKind,
        },
      },
    });
  }

  await grantDigitalWarehouseItem(pledge.id);

  return { ok: true as const, tax };
}
