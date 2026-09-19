import { prisma } from "@/lib/prisma";
import type { InvoiceDocumentData } from "@/components/invoice/InvoiceDocument";
import { estimateVatOnPlatformFee } from "@/lib/tax/money-flow";
import { numberToVietnameseWords } from "@/lib/utils";

function randomSerial(length = 5) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

function ymd(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function generateInvoiceNumber(): string {
  return `INV-${ymd()}-${randomSerial()}`;
}

export function generatePlatformInvoiceNumber(): string {
  return `PI-${ymd()}-${randomSerial()}`;
}

export function platformSeller() {
  return {
    name: process.env.PLATFORM_LEGAL_NAME || "CÔNG TY TNHH NỀN TẢNG TỬ TẾ FUND",
    taxCode: process.env.PLATFORM_TAX_CODE || "",
    address: process.env.PLATFORM_LEGAL_ADDRESS || "Việt Nam",
    phone: process.env.PLATFORM_PHONE || "hello@tutefund.vn",
    bank: [process.env.ESCROW_ACCOUNT_NUMBER, process.env.ESCROW_BANK_NAME, process.env.ESCROW_ACCOUNT_HOLDER]
      .filter(Boolean)
      .join(" · "),
    invoiceSymbol: process.env.PLATFORM_INVOICE_SYMBOL || "1C26TTF",
  };
}

export function extractTaxCode(value?: string | null) {
  if (!value) return "";
  const org = value.match(/ORG:([0-9]{10,13})/i);
  if (org) return org[1];
  const mst = value.match(/MST:([0-9]{10,13})/i);
  if (mst) return mst[1];
  const digits = value.replace(/\s+/g, "");
  if (/^[0-9]{10}([0-9]{3})?$/.test(digits)) return digits;
  return "";
}

function formatIssuedAt(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Tạo hóa đơn GTGT Creator → Backer (GIFT_NOW). Idempotent theo pledgeId.
 */
export async function createBackerInvoice(pledgeId: string) {
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
    include: {
      campaigns: {
        select: {
          title: true,
          creatorId: true,
          users: {
            select: {
              name: true,
              displayName: true,
              phone: true,
              bankAccount: true,
              bankName: true,
              businessLicense: true,
              shippingAddress: true,
              isOrganization: true,
              kyc_info: {
                select: {
                  fullName: true,
                  occupation: true,
                  currentAddress: true,
                  permanentAddress: true,
                  idCardNumber: true,
                },
              },
            },
          },
        },
      },
      rewards: { select: { title: true } },
      users: {
        select: {
          name: true,
          email: true,
          phone: true,
          shippingAddress: true,
          businessLicense: true,
          bankAccount: true,
          bankName: true,
          idCard: true,
          isOrganization: true,
          kyc_info: {
            select: {
              fullName: true,
              occupation: true,
              currentAddress: true,
              permanentAddress: true,
              idCardNumber: true,
            },
          },
        },
      },
    },
  });

  if (!pledge) {
    throw new Error("Pledge not found");
  }

  const existing = await prisma.backer_invoices.findUnique({
    where: { pledgeId },
  });

  if (existing) {
    return existing;
  }

  const buyer = pledge.users;
  const buyerTax = extractTaxCode(buyer?.kyc_info?.occupation) || extractTaxCode(buyer?.businessLicense);
  const buyerAddress =
    pledge.shippingAddress ||
    buyer?.kyc_info?.currentAddress ||
    buyer?.kyc_info?.permanentAddress ||
    buyer?.shippingAddress ||
    null;

  const invoice = await prisma.backer_invoices.create({
    data: {
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      pledgeId: pledge.id,
      backerName: pledge.displayName || buyer?.kyc_info?.fullName || buyer?.name || "Khách",
      backerEmail: pledge.email || buyer?.email || null,
      backerPhone: pledge.phoneNumber || buyer?.phone || null,
      backerAddress: buyerAddress,
      backerTaxCode: buyerTax || null,
      companyName: buyer?.isOrganization ? (buyer.name || buyer.kyc_info?.fullName || null) : null,
      amount: pledge.amount,
      tipAmount: pledge.tipAmount,
      platformFee: pledge.platformFee,
      vatAmount: pledge.vatAmount,
      totalAmount: pledge.totalAmount,
      campaignTitle: pledge.rewards?.title || pledge.campaigns?.title || "Sản phẩm Tử Tế Fund",
      paymentMethod: pledge.paymentProvider,
      transactionId: pledge.transactionId,
      status: "PAID",
      updatedAt: new Date(),
    },
  });

  return invoice;
}

/**
 * Hóa đơn phí dịch vụ sàn: Platform → Creator. Không đổi schema.
 */
export async function createPlatformFeeInvoice(pledgeId: string) {
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
    include: {
      campaigns: { select: { id: true, title: true, creatorId: true, feeRate: true } },
    },
  });
  if (!pledge?.campaignId || !pledge.campaigns?.creatorId) return null;

  const fee = Number(pledge.platformFee || 0);
  if (fee <= 0) return null;

  const existing = await prisma.platform_invoices.findFirst({
    where: {
      campaignId: pledge.campaignId,
      creatorId: pledge.campaigns.creatorId,
      paymentMethod: `pledge:${pledge.id}`,
    },
  });
  if (existing) return existing;

  const vat = estimateVatOnPlatformFee(fee);
  return prisma.platform_invoices.create({
    data: {
      id: crypto.randomUUID(),
      invoiceNumber: generatePlatformInvoiceNumber(),
      campaignId: pledge.campaignId,
      creatorId: pledge.campaigns.creatorId,
      amount: fee,
      vatAmount: vat,
      totalAmount: fee + vat,
      status: "PENDING",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      paymentMethod: `pledge:${pledge.id}`,
      updatedAt: new Date(),
    },
  });
}

export function mapBackerInvoiceToDocument(
  invoice: {
    invoiceNumber: string;
    issuedAt: Date;
    transactionId: string;
    paymentMethod: string;
    backerName: string;
    backerEmail?: string | null;
    backerPhone?: string | null;
    companyName?: string | null;
    backerTaxCode?: string | null;
    backerAddress?: string | null;
    campaignTitle: string;
    amount: unknown;
    tipAmount?: unknown;
    platformFee?: unknown;
    vatAmount?: unknown;
    totalAmount: unknown;
  },
  extras?: {
    sellerName?: string | null;
    sellerTaxCode?: string | null;
    sellerAddress?: string | null;
    sellerPhone?: string | null;
    sellerBank?: string | null;
    backerIdCard?: string | null;
    backerBank?: string | null;
    quantity?: number;
  },
): InvoiceDocumentData {
  const amount = Number(invoice.amount);
  const vat = Number(invoice.vatAmount || 0);
  const total = Number(invoice.totalAmount);
  const seller = platformSeller();
  return {
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: formatIssuedAt(invoice.issuedAt),
    transactionId: invoice.transactionId,
    paymentMethod: invoice.paymentMethod,
    backerName: invoice.backerName,
    backerEmail: invoice.backerEmail,
    backerPhone: invoice.backerPhone,
    companyName: invoice.companyName,
    backerTaxCode: invoice.backerTaxCode,
    backerAddress: invoice.backerAddress,
    backerIdCard: extras?.backerIdCard || null,
    backerBank: extras?.backerBank || null,
    campaignTitle: invoice.campaignTitle,
    quantity: extras?.quantity || 1,
    amount,
    tipAmount: Number(invoice.tipAmount || 0),
    platformFee: Number(invoice.platformFee || 0),
    vatAmount: vat,
    vatRateLabel: vat > 0 ? "8%" : "KCT",
    totalAmount: total,
    amountWords: numberToVietnameseWords(total),
    sellerName: extras?.sellerName || seller.name,
    sellerTaxCode: extras?.sellerTaxCode || seller.taxCode,
    sellerAddress: extras?.sellerAddress || seller.address,
    sellerPhone: extras?.sellerPhone || seller.phone,
    sellerBank: extras?.sellerBank || seller.bank,
    invoiceSymbol: seller.invoiceSymbol,
    lookupCode: invoice.invoiceNumber,
    kind: "SALE",
  };
}

export async function getVatInvoiceView(number: string): Promise<InvoiceDocumentData | null> {
  const code = number.trim();
  if (!code) return null;

  const backer = await prisma.backer_invoices.findUnique({
    where: { invoiceNumber: code },
    include: {
      pledges: {
        include: {
          users: {
            select: {
              idCard: true,
              bankAccount: true,
              bankName: true,
              kyc_info: { select: { idCardNumber: true } },
            },
          },
          campaigns: {
            select: {
              users: {
                select: {
                  name: true,
                  displayName: true,
                  phone: true,
                  bankAccount: true,
                  bankName: true,
                  businessLicense: true,
                  shippingAddress: true,
                  kyc_info: {
                    select: {
                      fullName: true,
                      occupation: true,
                      currentAddress: true,
                      permanentAddress: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (backer) {
    const creator = backer.pledges.campaigns?.users;
    const sellerTax = extractTaxCode(creator?.kyc_info?.occupation) || extractTaxCode(creator?.businessLicense);
    const sellerBank = [creator?.bankAccount, creator?.bankName].filter(Boolean).join(" · ");
    return mapBackerInvoiceToDocument(backer, {
      sellerName: creator?.kyc_info?.fullName || creator?.displayName || creator?.name,
      sellerTaxCode: sellerTax,
      sellerAddress: creator?.kyc_info?.currentAddress || creator?.kyc_info?.permanentAddress || creator?.shippingAddress,
      sellerPhone: creator?.phone,
      sellerBank,
      backerIdCard: backer.pledges.users?.kyc_info?.idCardNumber || backer.pledges.users?.idCard,
      backerBank: [backer.pledges.users?.bankAccount, backer.pledges.users?.bankName].filter(Boolean).join(" · "),
      quantity: backer.pledges.quantity,
    });
  }

  const fee = await prisma.platform_invoices.findUnique({
    where: { invoiceNumber: code },
    include: {
      users: {
        select: {
          name: true,
          displayName: true,
          phone: true,
          email: true,
          shippingAddress: true,
          businessLicense: true,
          bankAccount: true,
          bankName: true,
          idCard: true,
          isOrganization: true,
          kyc_info: {
            select: {
              fullName: true,
              occupation: true,
              currentAddress: true,
              permanentAddress: true,
              idCardNumber: true,
            },
          },
        },
      },
      campaigns: { select: { title: true } },
    },
  });

  if (!fee) return null;

  const seller = platformSeller();
  const creator = fee.users;
  const buyerTax = extractTaxCode(creator.kyc_info?.occupation) || extractTaxCode(creator.businessLicense);
  const total = Number(fee.totalAmount);
  const vat = Number(fee.vatAmount);
  return {
    invoiceNumber: fee.invoiceNumber,
    issuedAt: formatIssuedAt(fee.createdAt),
    transactionId: fee.paymentMethod,
    paymentMethod: "Khấu trừ phí dịch vụ sàn",
    backerName: creator.kyc_info?.fullName || creator.displayName || creator.name,
    backerEmail: creator.email,
    backerPhone: creator.phone,
    companyName: creator.isOrganization ? (creator.displayName || creator.name) : null,
    backerTaxCode: buyerTax || null,
    backerAddress: creator.kyc_info?.currentAddress || creator.kyc_info?.permanentAddress || creator.shippingAddress,
    backerIdCard: creator.kyc_info?.idCardNumber || creator.idCard,
    backerBank: [creator.bankAccount, creator.bankName].filter(Boolean).join(" · "),
    campaignTitle: `Phí dịch vụ sàn · ${fee.campaigns?.title || "chiến dịch"}`,
    itemUnit: "Gói",
    quantity: 1,
    amount: Number(fee.amount),
    vatAmount: vat,
    vatRateLabel: vat > 0 ? "8%" : "KCT",
    totalAmount: total,
    amountWords: numberToVietnameseWords(total),
    sellerName: seller.name,
    sellerTaxCode: seller.taxCode,
    sellerAddress: seller.address,
    sellerPhone: seller.phone,
    sellerBank: seller.bank,
    invoiceSymbol: seller.invoiceSymbol,
    lookupCode: fee.invoiceNumber,
    kind: "PLATFORM_FEE",
  };
}

export function generateInvoiceHTML(invoice: InvoiceDocumentData | Record<string, any>): string {
  const data: InvoiceDocumentData = "sellerName" in invoice || "campaignTitle" in invoice
    ? mapLoose(invoice)
    : mapLoose(invoice);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn ${data.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 24px; }
    .sheet { max-width: 800px; margin: 0 auto; background: white; padding: 36px; }
    h1 { color: #b91c1c; text-align: center; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #111; padding: 8px; font-size: 13px; }
    .muted { color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="sheet">
    <p class="muted" style="text-align:center">Đơn vị cung cấp phần mềm hóa đơn điện tử: VNPT</p>
    <h1>Hóa đơn giá trị gia tăng</h1>
    <p style="text-align:center">Ký hiệu: ${data.invoiceSymbol || "1C26TTF"} · Số: ${data.invoiceNumber}</p>
    <p><strong>Đơn vị bán hàng:</strong> ${data.sellerName || ""}</p>
    <p><strong>Mã số thuế:</strong> ${data.sellerTaxCode || "—"}</p>
    <p><strong>Địa chỉ:</strong> ${data.sellerAddress || "—"}</p>
    <p><strong>Người mua:</strong> ${data.backerName}</p>
    <p><strong>MST:</strong> ${data.backerTaxCode || "—"} · <strong>CCCD:</strong> ${data.backerIdCard || "—"}</p>
    <p><strong>Địa chỉ:</strong> ${data.backerAddress || "—"}</p>
    <table>
      <tr><th>STT</th><th>Tên hàng hóa, dịch vụ</th><th>ĐVT</th><th>SL</th><th>Thành tiền</th></tr>
      <tr><td>1</td><td>${data.campaignTitle}</td><td>${data.itemUnit || "Lần"}</td><td>${data.quantity || 1}</td><td>${formatVND(Number(data.amount))}</td></tr>
    </table>
    <p>Thuế suất GTGT: ${data.vatRateLabel || (Number(data.vatAmount) > 0 ? "8%" : "KCT")} · Tiền thuế: ${formatVND(Number(data.vatAmount || 0))}</p>
    <p><strong>Tổng cộng: ${formatVND(Number(data.totalAmount))}</strong></p>
    <p><em>${data.amountWords || ""}</em></p>
    <p class="muted">Mã tra cứu: ${data.lookupCode || data.invoiceNumber} · Mã CQT: ${data.taxAuthorityCode || "chưa gửi CQT"}</p>
  </div>
</body>
</html>
  `;
}

function mapLoose(invoice: Record<string, any>): InvoiceDocumentData {
  if (invoice.sellerName || invoice.kind) return invoice as InvoiceDocumentData;
  return mapBackerInvoiceToDocument(invoice as any);
}

export async function getBackerInvoice(pledgeId: string) {
  return prisma.backer_invoices.findUnique({
    where: { pledgeId },
  });
}

export async function getBackerInvoiceByNumber(invoiceNumber: string) {
  return prisma.backer_invoices.findUnique({
    where: { invoiceNumber },
  });
}
