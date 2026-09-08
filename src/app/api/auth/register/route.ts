import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkBlacklist } from "@/lib/blacklist";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword, isOrganization, acceptTerms } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Vui lòng nhập họ và tên hợp lệ" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email hợp lệ" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Mật khẩu xác nhận không khớp" },
        { status: 400 }
      );
    }

    if (acceptTerms !== true) {
      return NextResponse.json(
        { error: "Bạn cần đồng ý Điều khoản sử dụng và Chính sách bảo mật để tạo tài khoản." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const blacklistResult = await checkBlacklist({
      email: normalizedEmail,
      ip: ip || undefined,
    });

    if (blacklistResult.blocked) {
      return NextResponse.json(
        { error: "Tài khoản hoặc địa chỉ kết nối đã bị hạn chế đăng ký trên hệ thống." },
        { status: 403 }
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        name: name.trim(),
        displayName: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: isOrganization ? "CREATOR" : "BACKER",
        isOrganization: Boolean(isOrganization),
        status: "NORMAL",
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOrganization: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đăng ký tài khoản thành công",
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/auth/register] Error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
