import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ userId: string }>;

/**
 * POST /api/admin/users/[userId]/update-status
 * Cập nhật status của user (chỉ Admin)
 */
export async function POST(req: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const { userId } = await params;
        const body = await req.json();
        const { status } = body;

        // Validate status
        const validStatuses = ["NORMAL", "PRO", "BANNED"];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Status không hợp lệ. Phải là NORMAL, PRO hoặc BANNED" },
                { status: 400 }
            );
        }

        // Lấy thông tin user hiện tại
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, status: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
        }

        // Validate status theo role
        if (user.role === "BACKER" && status === "PRO") {
            return NextResponse.json(
                { error: "BACKER không thể có status PRO" },
                { status: 400 }
            );
        }

        if (user.role === "ADMIN") {
            return NextResponse.json(
                { error: "Không thể thay đổi status của ADMIN" },
                { status: 400 }
            );
        }

        // Update status
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { status },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true
            }
        });

        const statusLabels: Record<string, string> = {
            NORMAL: "thường",
            PRO: "Pro",
            BANNED: "cấm"
        };

        return NextResponse.json({
            success: true,
            user: updatedUser,
            message: `Đã đổi trạng thái ${user.name} sang ${statusLabels[status]}`
        });

    } catch (error) {
        console.error("[POST /api/admin/users/update-status]", error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}
