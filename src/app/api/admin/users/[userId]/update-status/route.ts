import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    const { userId } = await context.params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["NORMAL", "PRO", "BANNED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ. Chỉ chấp nhận NORMAL, PRO, hoặc BANNED." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      message: `Đã cập nhật trạng thái thành công`,
      users: updatedUser,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/users/:userId/update-status]", error);
    return NextResponse.json(
      { error: error.message || "Lỗi cập nhật trạng thái người dùng" },
      { status: 500 }
    );
  }
}
