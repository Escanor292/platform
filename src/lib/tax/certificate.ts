import { randomBytes, randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/mail";
import { getSiteUrl } from "@/lib/seo";
import {
  classifyMoneyFlow,
  documentKindForFlow,
  documentKindLabel,
  formatCertificateCode,
  moneyFlowLabel,
  randomCertificateSerial,
  type MoneyFlow,
  type TaxDocumentKind,
} from "@/lib/tax/money-flow";

function siteUrl() {
  return getSiteUrl().replace(/\/$/, "");
}

async function nextCertificateCode(issuedAt = new Date()) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = formatCertificateCode(issuedAt, randomCertificateSerial(randomBytes(4)));
    const exists = await prisma.donation_certificates.findUnique({ where: { code }, select: { id: true } });
    if (!exists) return code;
  }
  return formatCertificateCode(issuedAt, randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase());
}

export function certificatePublicUrl(code: string) {
  return `${siteUrl()}/chung-tu/${encodeURIComponent(code)}`;
}

export async function issueTaxDocumentForPledge(pledgeId: string) {
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
    include: {
      campaigns: { select: { id: true, title: true, slug: true, creatorId: true, feeRate: true } },
      rewards: { select: { id: true, title: true, isPreorder: true } },
      users: { select: { id: true, email: true, name: true } },
      donation_certificate: true,
    },
  });

  if (!pledge || pledge.status !== "SUCCESS") {
    return { issued: false as const, reason: "pledge-not-success" as const };
  }

  const flow = classifyMoneyFlow({
    rewardId: pledge.rewardId,
    isPreorder: pledge.rewards?.isPreorder,
  });
  const documentKind = documentKindForFlow(flow);
  if (!documentKind) {
    return { issued: false as const, reason: "preorder-skipped" as const, flow };
  }

  if (pledge.donation_certificate) {
    return { issued: true as const, created: false as const, certificate: pledge.donation_certificate, flow };
  }

  const guestEmail = (pledge.email || pledge.users?.email || "").trim().toLowerCase() || null;
  const displayName = pledge.isAnonymous ? "Người ủng hộ ẩn danh" : (pledge.displayName || pledge.users?.name || "Khách");
  const now = new Date();
  const code = await nextCertificateCode(now);

  const certificate = await prisma.donation_certificates.create({
    data: {
      id: randomUUID(),
      code,
      pledgeId: pledge.id,
      campaignId: pledge.campaignId,
      creatorId: pledge.campaigns?.creatorId || null,
      backerUserId: pledge.userId,
      guestEmail,
      displayName,
      amount: pledge.amount,
      flowType: flow,
      documentKind,
      status: pledge.userId ? "CLAIMED" : "ISSUED",
      issuedAt: now,
      claimedAt: pledge.userId ? now : null,
      claimedByUserId: pledge.userId,
      updatedAt: now,
    },
  });

  return { issued: true as const, created: true as const, certificate, flow };
}

export async function sendCertificateEmail(code: string) {
  const certificate = await prisma.donation_certificates.findUnique({
    where: { code },
    include: {
      campaigns: { select: { title: true, slug: true } },
      pledges: { select: { transactionId: true, totalAmount: true } },
    },
  });
  if (!certificate?.guestEmail) {
    return { delivered: false as const, reason: "no-email" as const };
  }

  const url = certificatePublicUrl(certificate.code);
  const kindLabel = documentKindLabel(certificate.documentKind);
  const flowLabel = moneyFlowLabel(certificate.flowType as MoneyFlow);
  const subject = `${kindLabel} ${certificate.code} — Tử Tế Fund`;
  const text = [
    `Xin chào,`,
    ``,
    `Đây là ${kindLabel.toLowerCase()} cho khoản ${flowLabel.toLowerCase()}.`,
    `Mã: ${certificate.code}`,
    `Số tiền: ${Number(certificate.amount).toLocaleString("vi-VN")}đ`,
    certificate.campaigns?.title ? `Chiến dịch: ${certificate.campaigns.title}` : "",
    `Xem và in: ${url}`,
    ``,
    `Chứng từ này không phải hóa đơn GTGT. Creator tự xuất hóa đơn nếu bạn yêu cầu và họ đủ điều kiện.`,
    `Nếu bạn đăng nhập bằng đúng email này, chứng từ sẽ vào Kho đồ.`,
  ].filter(Boolean).join("\n");

  const html = `
    <p>Xin chào,</p>
    <p>Đây là <strong>${kindLabel}</strong> cho khoản <strong>${flowLabel.toLowerCase()}</strong>.</p>
    <p>Mã: <strong>${certificate.code}</strong><br/>
    Số tiền: <strong>${Number(certificate.amount).toLocaleString("vi-VN")}đ</strong><br/>
    ${certificate.campaigns?.title ? `Chiến dịch: ${certificate.campaigns.title}<br/>` : ""}
    </p>
    <p><a href="${url}">Xem và in chứng từ</a></p>
    <p style="color:#666;font-size:13px">Chứng từ này <strong>không phải hóa đơn GTGT</strong>. Creator tự xuất hóa đơn nếu bạn yêu cầu và họ đủ điều kiện. Đăng nhập bằng đúng email này để lưu vào Kho đồ.</p>
  `;

  const result = await sendTransactionalEmail({
    email: certificate.guestEmail,
    subject,
    text,
    html,
  });

  if (result.delivered) {
    await prisma.donation_certificates.update({
      where: { id: certificate.id },
      data: { emailSentAt: new Date(), updatedAt: new Date() },
    });
  }

  return result;
}

export async function claimCertificatesForUser(user: { id: string; email?: string | null }) {
  const email = user.email?.trim().toLowerCase();
  if (!email) return { claimed: 0 };

  const result = await prisma.donation_certificates.updateMany({
    where: {
      guestEmail: email,
      OR: [{ backerUserId: null }, { backerUserId: user.id }],
      status: { in: ["ISSUED", "CLAIMED"] },
    },
    data: {
      backerUserId: user.id,
      claimedByUserId: user.id,
      claimedAt: new Date(),
      status: "CLAIMED",
      updatedAt: new Date(),
    },
  });

  await prisma.pledges.updateMany({
    where: {
      userId: null,
      email,
      status: "SUCCESS",
    },
    data: {
      userId: user.id,
      updatedAt: new Date(),
    },
  });

  return { claimed: result.count };
}

export async function claimCertificateByCode(code: string, user: { id: string; email?: string | null }) {
  const certificate = await prisma.donation_certificates.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!certificate || certificate.status === "REVOKED") {
    return { ok: false as const, reason: "not-found" as const };
  }

  const email = user.email?.trim().toLowerCase();
  const owns =
    certificate.backerUserId === user.id ||
    (email && certificate.guestEmail?.toLowerCase() === email);

  if (!owns) {
    return { ok: false as const, reason: "forbidden" as const };
  }

  const updated = await prisma.donation_certificates.update({
    where: { id: certificate.id },
    data: {
      backerUserId: user.id,
      claimedByUserId: user.id,
      claimedAt: certificate.claimedAt || new Date(),
      status: "CLAIMED",
      updatedAt: new Date(),
    },
  });

  if (!certificate.backerUserId) {
    await prisma.pledges.update({
      where: { id: certificate.pledgeId },
      data: { userId: user.id, updatedAt: new Date() },
    });
  }

  return { ok: true as const, certificate: updated };
}

export function certificateHtml(input: {
  code: string;
  documentKind: TaxDocumentKind;
  flowType: MoneyFlow;
  displayName: string;
  amount: number;
  amountWords?: string;
  campaignTitle?: string | null;
  creatorName?: string | null;
  creatorKycVerified?: boolean;
  transactionId?: string | null;
  issuedAt: Date;
  /** Email đầy đủ của chính chủ — chứng từ riêng tư, không che */
  ownerEmail?: string | null;
  /** SĐT đầy đủ của chính chủ — chứng từ riêng tư, không che */
  ownerPhone?: string | null;
  tipAmount?: number;
  verifyUrl?: string;
}) {
  const amount = Number(input.amount).toLocaleString("vi-VN");
  const amountWords = input.amountWords || `${amount} đồng`;
  const issued = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(input.issuedAt);
  const verifyUrl = input.verifyUrl || `https://tutefund.vn/chung-tu/${input.code}`;
  const kycLabel = input.creatorKycVerified ? "Đã xác minh" : "Chưa xác minh";

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Giấy Chứng Nhận ${input.code} — Tử Tế Fund</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f3efe6; color: #1F4E79; margin: 0; padding: 24px; }
    .sheet {
      max-width: 780px; margin: 0 auto; background: #fff;
      border: 2px solid #c8d8b0; border-radius: 16px; padding: 40px 48px;
      position: relative;
    }
    .sheet::before {
      content: '';
      position: absolute; inset: 8px;
      border: 1px dashed #c8d8b0;
      border-radius: 12px;
      pointer-events: none;
    }
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #2E8B57; }
    .logo-block { display: flex; flex-direction: column; }
    .logo-name { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 900; color: #2E8B57; letter-spacing: 0.06em; }
    .logo-sub { font-size: 11px; color: #6B7280; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
    .header-right { text-align: right; font-size: 12px; }
    .header-right .label { color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; }
    .code-val { font-family: monospace; font-size: 15px; font-weight: 800; color: #1F4E79; letter-spacing: 0.1em; }
    /* Stamp seal */
    .stamp-outer {
      width: 88px; height: 88px; border-radius: 50%;
      border: 3px solid #2E8B57;
      display: flex; align-items: center; justify-content: center;
      text-align: center; font-size: 8px; font-weight: 800;
      color: #2E8B57; letter-spacing: 0.06em; line-height: 1.3;
      margin-top: 4px; padding: 4px;
      text-transform: uppercase;
    }
    /* Title */
    .title-block { text-align: center; margin: 20px 0 16px; }
    .main-title { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 900; color: #1F4E79; letter-spacing: 0.04em; }
    .sub-title { font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #2E8B57; font-weight: 700; margin-top: 4px; letter-spacing: 0.08em; }
    .divider { border: none; border-top: 1px solid #d1e4c0; margin: 16px 0; }
    /* Vinh danh block */
    .honor-block { background: #f0f7ec; border: 1px solid #c8e0b0; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; }
    .honor-label { font-size: 10px; color: #2E8B57; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 6px; }
    .honor-name { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 900; color: #1F4E79; }
    .honor-meta { font-size: 12px; color: #4B5563; margin-top: 4px; line-height: 1.6; }
    /* Info table */
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
    .info-table td { padding: 8px 0; border-bottom: 1px solid #e8f0e0; }
    .info-table td:first-child { color: #6B7280; width: 46%; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
    .info-table td:last-child { font-weight: 600; color: #1F4E79; }
    .amount-big { font-size: 18px; font-weight: 900; color: #2E8B57; }
    /* Gratitude */
    .gratitude { background: #fefdf9; border-left: 3px solid #2E8B57; padding: 12px 16px; margin: 16px 0; font-size: 12.5px; color: #374151; line-height: 1.7; font-style: italic; }
    /* Signature row */
    .sig-row { display: flex; gap: 32px; margin-top: 24px; }
    .sig-box { flex: 1; border: 1px solid #c8d8b0; border-radius: 8px; padding: 16px; text-align: center; min-height: 90px; }
    .sig-title { font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-bottom: 4px; }
    .sig-name { font-size: 13px; font-weight: 700; color: #1F4E79; margin-top: 8px; }
    .sig-note { font-size: 10px; color: #9CA3AF; margin-top: 2px; }
    .sig-digital { font-size: 10px; color: #2E8B57; margin-top: 6px; }
    /* Footer */
    .cert-footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9CA3AF; text-align: center; line-height: 1.6; }
    .disclaimer { font-size: 11px; color: #6B7280; background: #f9fafb; border-radius: 6px; padding: 10px 14px; margin-top: 14px; line-height: 1.6; }
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { border: 1px solid #c8d8b0; border-radius: 0; box-shadow: none; }
      .sheet::before { display: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">

    <!-- HEADER -->
    <div class="header">
      <div class="logo-block">
        <span class="logo-name">🌱 TỬ TẾ FUND</span>
        <span class="logo-sub">Nền tảng gây quỹ cộng đồng</span>
      </div>
      <div class="header-right">
        <div class="label">Mã xác thực</div>
        <div class="code-val">${input.code}</div>
        <div class="stamp-outer">TỬ TẾ<br/>FUND<br/>·<br/>CHỨNG TỪ<br/>ĐIỆN TỬ</div>
      </div>
    </div>

    <!-- TITLE -->
    <div class="title-block">
      <div class="main-title">GIẤY CHỨNG NHẬN</div>
      <div class="sub-title">TẤM LÒNG VÀNG ĐỒNG HÀNH</div>
    </div>
    <hr class="divider" />

    <!-- VINH DANH -->
    <div class="honor-block">
      <div class="honor-label">Trân trọng vinh danh và tri ân</div>
      <div class="honor-name">${input.displayName}</div>
      <div class="honor-meta">
        ${input.ownerEmail ? `Email: ${input.ownerEmail}` : ""}
        ${input.ownerPhone ? `&nbsp;&nbsp;|&nbsp;&nbsp;SĐT: ${input.ownerPhone}` : ""}
      </div>
      <div class="honor-meta" style="margin-top:4px">Đã tự nguyện đóng góp, không nhận sản phẩm/quà tặng, đồng hành cùng:</div>
    </div>

    <!-- BẢNG DỰ ÁN + CHI TIẾT -->
    <table class="info-table">
      ${input.campaignTitle ? `<tr><td>Tên chiến dịch</td><td>${input.campaignTitle}</td></tr>` : ""}
      ${input.creatorName ? `<tr><td>Người gọi vốn</td><td>${input.creatorName} <span style="font-size:11px;color:#6B7280;">(KYC: ${kycLabel})</span></td></tr>` : ""}
      <tr><td>Hình thức</td><td>Quyên góp tự nguyện không nhận quà (NO_GIFT)</td></tr>
      ${input.transactionId ? `<tr><td>Mã giao dịch</td><td style="font-family:monospace;font-size:12px">${input.transactionId}</td></tr>` : ""}
      <tr>
        <td>Số tiền</td>
        <td>
          <span class="amount-big">${amount} VNĐ</span><br/>
          <span style="font-size:11px;color:#4B5563;">(${amountWords})</span>
        </td>
      </tr>
      ${input.tipAmount && input.tipAmount > 0 ? `<tr><td>Ủng hộ thêm nền tảng</td><td>${Number(input.tipAmount).toLocaleString("vi-VN")} VNĐ</td></tr>` : ""}
      <tr><td>Phương thức</td><td>Chuyển khoản tài khoản ngân hàng trung gian (BANK_ESCROW)</td></tr>
      <tr><td>Thời gian cấp</td><td>${issued}</td></tr>
      <tr><td>Tên vinh danh</td><td>${input.displayName}</td></tr>
    </table>

    <!-- LỜI TRI ÂN -->
    <div class="gratitude">
      Cảm ơn bạn đã tin tưởng và chọn đồng hành cùng chiến dịch này trên Tử Tế Fund. Tấm lòng của bạn là nguồn
      động lực quý giá cho người gọi vốn và cộng đồng. Chứng từ này ghi nhận sự đóng góp tự nguyện của bạn
      như một dấu ấn thiện tâm đáng trân trọng.
    </div>

    <!-- CHỮ KÝ -->
    <div style="font-size:12px;color:#6B7280;margin-bottom:8px;">Ngày cấp: ${issued}</div>
    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-title">Đại diện nền tảng</div>
        <div class="sig-title">Tử Tế Fund</div>
        <div class="sig-digital">✦ Chữ ký số hệ thống ✦</div>
        <div class="sig-name">Ban Vận Hành</div>
        <div class="sig-note">Xuất tự động, có giá trị xác thực tại link bên dưới</div>
      </div>
      <div class="sig-box">
        <div class="sig-title">Người gọi vốn</div>
        ${input.creatorName ? `<div class="sig-name">${input.creatorName}</div>` : ""}
        <div class="sig-note" style="margin-top:10px">Chứng từ do sàn cấp.<br/>Creator xác nhận khi đối soát.</div>
      </div>
    </div>

    <!-- DISCLAIMER -->
    <div class="disclaimer">
      ⓘ Đây là chứng từ đối chiếu thanh toán nội bộ do Tử Tế Fund cấp tự động sau khi xác nhận tiền vào
      tài khoản ngân hàng trung gian. <strong>Không phải hóa đơn GTGT / hóa đơn điện tử theo Nghị định 123/2020/NĐ-CP.</strong>
      Tử Tế Fund là sàn trung gian, không phải quỹ từ thiện được cấp phép. Người đóng góp trả giá niêm yết,
      không cộng VAT trên checkout. Hóa đơn GTGT (nếu có) do Creator tự xuất khi đủ điều kiện.
    </div>

    <!-- FOOTER -->
    <div class="cert-footer">
      Xuất tự động từ hệ thống Tử Tế Fund &nbsp;·&nbsp; Không phải hóa đơn GTGT
      &nbsp;·&nbsp; Đối soát: <strong>${verifyUrl}</strong>
    </div>

  </div>
</body>
</html>`;
}
