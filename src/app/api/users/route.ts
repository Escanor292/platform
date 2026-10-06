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
    const actor = session?.user as { role?: string; isAdmin?: boolean } | undefined;
    if (!actor || (actor.role !== "ADMIN" && !actor.isAdmin)) {
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const data: { name?: string; avatar?: string | null } = {};
    if (typeof body?.name === "string") {
      const name = body.name.trim().slice(0, 80);
      if (!name) {
        return NextResponse.json({ error: "Tên không hợp lệ" }, { status: 400 });
      }
      data.name = name;
    }
    if (typeof body?.avatar === "string") {
      const avatar = body.avatar.trim().slice(0, 500);
      if (avatar && !/^https:\/\//i.test(avatar)) {
        return NextResponse.json({ error: "Ảnh đại diện phải là liên kết https" }, { status: 400 });
      }
      data.avatar = avatar || null;
    }
    if (!data.name && data.avatar === undefined) {
      return NextResponse.json({ error: "Không có dữ liệu để cập nhật" }, { status: 400 });
    }

    const updated = await prisma.users.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, avatar: true, image: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/users]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
