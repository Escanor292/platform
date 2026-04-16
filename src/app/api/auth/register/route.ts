import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, isOrganization } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default role BACKER
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "BACKER", // Mặc định là BACKER
        isOrganization: isOrganization || false,
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
        message: "Đăng ký thành công",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { error: "Lỗi server khi đăng ký" },
      { status: 500 }
    );
  }
}
