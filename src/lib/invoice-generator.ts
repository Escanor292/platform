import { prisma } from "@/lib/prisma";

/**
 * Tạo số hóa đơn duy nhất
 * Format: INV-YYYYMMDD-XXXXX
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `INV-${year}${month}${day}-${random}`;
}

/**
 * Tạo hóa đơn cho Backer
 */
export async function createBackerInvoice(pledgeId: string) {
  // Lấy thông tin pledge
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
    include: {
      campaigns: {
        select: {
          title: true,
        },
      },
      users: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!pledge) {
    throw new Error("Pledge not found");
  }

  // Kiểm tra đã có hóa đơn chưa
  const existing = await prisma.backer_invoices.findUnique({
    where: { pledgeId },
  });

  if (existing) {
    return existing;
  }

  // Tạo hóa đơn mới
  const invoice = await prisma.backer_invoices.create({
    data: {
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      pledgeId: pledge.id,
      backerName: pledge.displayName,
      backerEmail: pledge.email || pledge.users?.email || null,
      backerPhone: pledge.phoneNumber || pledge.users?.phone || null,
      amount: pledge.amount,
      tipAmount: pledge.tipAmount,
      platformFee: pledge.platformFee,
      vatAmount: pledge.vatAmount,
      totalAmount: pledge.totalAmount,
      campaignTitle: pledge.campaigns.title,
      paymentMethod: pledge.paymentProvider,
      transactionId: pledge.transactionId,
      status: "PAID",
      updatedAt: new Date(),
    },
  });

  return invoice;
}

/**
 * Generate HTML cho hóa đơn (để convert sang PDF)
 */
export function generateInvoiceHTML(invoice: any): string {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa đơn ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; padding: 40px; background: #f5f5f5; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 60px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 30px; margin-bottom: 40px; }
    .header h1 { color: #2563eb; font-size: 32px; margin-bottom: 10px; }
    .header p { color: #666; font-size: 14px; }
    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .invoice-info div { flex: 1; }
    .invoice-info h3 { color: #333; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
    .invoice-info p { color: #666; font-size: 13px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f8f9fa; padding: 15px; text-align: left; font-size: 13px; color: #333; border-bottom: 2px solid #dee2e6; }
    td { padding: 15px; border-bottom: 1px solid #dee2e6; font-size: 13px; color: #666; }
    .total-row { background: #f8f9fa; font-weight: bold; }
    .total-row td { color: #2563eb; font-size: 16px; }
    .footer { text-align: center; padding-top: 30px; border-top: 2px solid #dee2e6; color: #999; font-size: 12px; }
    .stamp { text-align: right; margin-top: 40px; }
    .stamp p { color: #666; font-size: 12px; font-style: italic; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>HÓA ĐƠN ĐIỆN TỬ</h1>
      <p>CROWDFUNDING VN - NỀN TẢNG GỌI VỐN CỘNG ĐỒNG</p>
      <p>Địa chỉ: [Địa chỉ công ty] | Điện thoại: [SĐT] | Email: support@crowdfundingvn.com</p>
      <p>Mã số thuế: [Mã số thuế công ty]</p>
    </div>

    <div class="invoice-info">
      <div>
        <h3>Thông tin hóa đơn</h3>
        <p><strong>Số hóa đơn:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Ngày xuất:</strong> ${formatDate(invoice.issuedAt)}</p>
        <p><strong>Mã giao dịch:</strong> ${invoice.transactionId}</p>
        <p><strong>Phương thức:</strong> ${invoice.paymentMethod}</p>
      </div>
      <div>
        <h3>Thông tin khách hàng</h3>
        <p><strong>Họ tên:</strong> ${invoice.backerName}</p>
        ${invoice.backerEmail ? `<p><strong>Email:</strong> ${invoice.backerEmail}</p>` : ""}
        ${invoice.backerPhone ? `<p><strong>SĐT:</strong> ${invoice.backerPhone}</p>` : ""}
        ${invoice.companyName ? `<p><strong>Công ty:</strong> ${invoice.companyName}</p>` : ""}
        ${invoice.backerTaxCode ? `<p><strong>MST:</strong> ${invoice.backerTaxCode}</p>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Nội dung</th>
          <th style="text-align: right;">Số tiền</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Ủng hộ chiến dịch: <strong>${invoice.campaignTitle}</strong></td>
          <td style="text-align: right;">${formatVND(Number(invoice.amount))}</td>
        </tr>
        ${Number(invoice.tipAmount) > 0 ? `
        <tr>
          <td>Tip hỗ trợ nền tảng</td>
          <td style="text-align: right;">${formatVND(Number(invoice.tipAmount))}</td>
        </tr>
        ` : ""}
        ${Number(invoice.platformFee) > 0 ? `
        <tr>
          <td>Phí dịch vụ</td>
          <td style="text-align: right;">${formatVND(Number(invoice.platformFee))}</td>
        </tr>
        ` : ""}
        ${Number(invoice.vatAmount) > 0 ? `
        <tr>
          <td>VAT (10%)</td>
          <td style="text-align: right;">${formatVND(Number(invoice.vatAmount))}</td>
        </tr>
        ` : ""}
        <tr class="total-row">
          <td><strong>TỔNG CỘNG</strong></td>
          <td style="text-align: right;"><strong>${formatVND(Number(invoice.totalAmount))}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="stamp">
      <p>Hóa đơn được tạo tự động bởi hệ thống</p>
      <p>Ngày in: ${formatDate(new Date())}</p>
    </div>

    <div class="footer">
      <p>Cảm ơn bạn đã ủng hộ dự án trên Crowdfunding VN!</p>
      <p>Mọi thắc mắc vui lòng liên hệ: support@crowdfundingvn.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Lấy hóa đơn theo pledgeId
 */
export async function getBackerInvoice(pledgeId: string) {
  return await prisma.backer_invoices.findUnique({
    where: { pledgeId },
  });
}

/**
 * Lấy hóa đơn theo invoiceNumber
 */
export async function getBackerInvoiceByNumber(invoiceNumber: string) {
  return await prisma.backer_invoices.findUnique({
    where: { invoiceNumber },
  });
}
