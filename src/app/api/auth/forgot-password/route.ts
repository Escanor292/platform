import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PASSWORD_RESET_TTL_MS,
  createPasswordResetToken,
  getPasswordResetUrl,
  sendPasswordResetEmail,
} from "@/lib/password-reset";

const GENERIC_RESPONSE = {
  message: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
};

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body.email);

    if (!email || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Vui lòng nhập email hợp lệ." }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    // Do not reveal whether an email exists or whether it uses OAuth only.
    if (!user || !user.password) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
    }

    const { rawToken, tokenHash } = createPasswordResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    await prisma.$transaction([
      prisma.password_reset_tokens.deleteMany({ where: { userId: user.id, usedAt: null } }),
      prisma.password_reset_tokens.create({
        data: { userId: user.id, tokenHash, expiresAt },
      }),
    ]);

    const resetUrl = getPasswordResetUrl(rawToken, request.nextUrl.origin);
    try {
      const delivery = await sendPasswordResetEmail({
        email: user.email,
        recipientName: user.name,
        resetUrl,
      });

      if (!delivery.delivered && process.env.NODE_ENV === "development") {
        return NextResponse.json({ ...GENERIC_RESPONSE, debugResetUrl: resetUrl }, { status: 202 });
      }
    } catch (error) {
      console.error("[FORGOT_PASSWORD] Email delivery failed", error instanceof Error ? error.message : "unknown error");
      // Do not expose provider details or user existence to the client.
      return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
    }

    return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
  } catch (error) {
    console.error("[FORGOT_PASSWORD] Request failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
