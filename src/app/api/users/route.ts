import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/users
 * Lấy danh sách người dùng (chỉ cho admin)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET /api/users]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

/**
 * PUT /api/users
 * Cập nhật thông tin bản thân
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    const { name, avatar } = await req.json();

    const updated = await prisma.users.update({
      where: { id: session.user.id },
      data: { name, avatar },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/users]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
