import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashPasswordResetToken } from "@/lib/password-reset";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json({ error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.` }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Mật khẩu xác nhận không khớp." }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(token);
    const now = new Date();
    const resetToken = await prisma.password_reset_tokens.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
      select: { id: true, userId: true },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (tx) => {
      const claimed = await tx.password_reset_tokens.updateMany({
        where: { id: resetToken.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });

      if (claimed.count !== 1) return false;

      await tx.users.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword, updatedAt: now },
      });
      await tx.password_reset_tokens.deleteMany({
        where: { userId: resetToken.userId, id: { not: resetToken.id } },
      });
      return true;
    });

    if (!result) {
      return NextResponse.json({ error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." }, { status: 400 });
    }

    return NextResponse.json({ message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
  } catch (error) {
    console.error("[RESET_PASSWORD] Request failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Không thể đặt lại mật khẩu lúc này. Vui lòng thử lại." }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
