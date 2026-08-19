import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/rewards/my
 * Lấy danh sách chiến dịch của creator kèm rewards hiện có.
 * Dùng cho modal "Thêm sản phẩm" trên tab Sản phẩm của trang cá nhân.
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const campaigns = await prisma.campaigns.findMany({
            where: {
                creatorId: (session.user as any).id,
                status: { in: ["ACTIVE", "SUCCESS", "DRAFT"] },
            },
            select: {
                id: true,
                slug: true,
                title: true,
                type: true,
                status: true,
                rewards: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        minAmount: true,
                        maxQuantity: true,
                        deliveryDate: true,
                        isActive: true,
                        createdAt: true,
                        _count: {
                            select: { pledges: true },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const serialized = campaigns.map((c) => ({
            ...c,
            rewards: c.rewards.map((r) => ({
                ...r,
                minAmount: Number(r.minAmount),
                _count: r._count,
            })),
        }));

        return NextResponse.json({ campaigns: serialized });
    } catch (error) {
        console.error("[GET /api/rewards/my]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
