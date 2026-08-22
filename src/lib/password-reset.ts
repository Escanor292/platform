import crypto from "node:crypto";

const RESET_TOKEN_BYTES = 32;
export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

export function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export function hashPasswordResetToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function getPasswordResetUrl(rawToken: string, requestOrigin: string) {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || requestOrigin;
  return `${baseUrl.replace(/\/$/, "")}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;
}

export async function sendPasswordResetEmail({
  email,
  recipientName,
  resetUrl,
}: {
  email: string;
  recipientName: string;
  resetUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") return { delivered: false, reason: "development-missing-email-config" as const };
    throw new Error("Password reset email provider is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Đặt lại mật khẩu Tử Tế Fund",
      text: `Xin chào ${recipientName || "bạn"},\n\nBạn vừa yêu cầu đặt lại mật khẩu Tử Tế Fund. Liên kết có hiệu lực trong 30 phút và chỉ dùng được một lần:\n\n${resetUrl}\n\nNếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.`,
      html: `<p>Xin chào ${recipientName || "bạn"},</p><p>Bạn vừa yêu cầu đặt lại mật khẩu Tử Tế Fund.</p><p><a href="${resetUrl}">Đặt lại mật khẩu</a></p><p>Liên kết có hiệu lực trong 30 phút và chỉ dùng được một lần.</p><p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Password reset email failed with status ${response.status}`);
  }

  return { delivered: true as const };
}
