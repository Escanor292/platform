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
  campaignTitle?: string | null;
  transactionId?: string | null;
  issuedAt: Date;
  guestEmail?: string | null;
}) {
  const kindLabel = documentKindLabel(input.documentKind);
  const flowLabel = moneyFlowLabel(input.flowType);
  const amount = Number(input.amount).toLocaleString("vi-VN");
  const issued = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(input.issuedAt);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${kindLabel} ${input.code}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f3efe6; color: #1c2118; margin: 0; padding: 32px; }
    .sheet { max-width: 720px; margin: 0 auto; background: #fff; border: 1px solid #d7d2c6; border-radius: 24px; padding: 40px; }
    h1 { font-size: 28px; margin: 0 0 8px; }
    .code { font-size: 22px; letter-spacing: 0.12em; font-weight: 800; color: #1a6b46; }
    .muted { color: #667; font-size: 13px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    .stamp { margin-top: 28px; font-size: 12px; color: #888; }
    @media print { body { background: #fff; padding: 0; } .sheet { border: none; } }
  </style>
</head>
<body>
  <div class="sheet">
    <p class="muted">Tử Tế Fund · chứng từ điện tử</p>
    <h1>${kindLabel}</h1>
    <p class="code">${input.code}</p>
    <table>
      <tr><td>Loại khoản</td><td style="text-align:right">${flowLabel}</td></tr>
      <tr><td>Người ủng hộ</td><td style="text-align:right">${input.displayName}</td></tr>
      ${input.guestEmail ? `<tr><td>Email nhận</td><td style="text-align:right">${input.guestEmail}</td></tr>` : ""}
      ${input.campaignTitle ? `<tr><td>Chiến dịch</td><td style="text-align:right">${input.campaignTitle}</td></tr>` : ""}
      <tr><td>Số tiền</td><td style="text-align:right"><strong>${amount}đ</strong></td></tr>
      ${input.transactionId ? `<tr><td>Mã giao dịch</td><td style="text-align:right">${input.transactionId}</td></tr>` : ""}
      <tr><td>Ngày cấp</td><td style="text-align:right">${issued}</td></tr>
    </table>
    <p class="muted">
      Đây là ${kindLabel.toLowerCase()} do nền tảng cấp để đối chiếu thanh toán.
      <strong>Không phải hóa đơn GTGT / hóa đơn điện tử theo Nghị định 123</strong>.
      Người mua lẻ không bị cộng VAT trên giá niêm yết. Hóa đơn GTGT (nếu có) do Creator xuất.
    </p>
    <p class="stamp">Tử Tế Fund · sổ sách nội bộ · ${input.code}</p>
  </div>
</body>
</html>`;
}
