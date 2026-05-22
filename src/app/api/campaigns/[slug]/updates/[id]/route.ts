import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * PUT /api/campaigns/[slug]/updates/[id]
 * Cập nhật một update (Chỉ Creator)
 */
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ slug: string; id: string} }>
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug, id } = await params;
        const { title, content, imageUrl, tags, isPinned } = await req.json();

        // Kiểm tra update có tồn tại và thuộc campaign này không
        const update = await prisma.campaignUpdate.findUnique({
            where: { id },
            include: {
                campaign: {
                    select: { id: true, creatorId: true, slug: true }
                }
            }
        });

        if (!update) {
            return NextResponse.json({ error: "Update not found" }, { status: 404 });
        }

        // Kiểm tra slug có khớp không
        if (update.campaign.slug !== slug && update.campaign.id !== slug) {
            return NextResponse.json({ error: "Update does not belong to this campaign" }, { status: 400 });
        }

        // Kiểm tra quyền (phải là chủ dự án)
        if (update.campaign.creatorId !== (session.user as any).id) {
            return NextResponse.json({ error: "Bạn không có quyền chỉnh sửa cập nhật này" }, { status: 403 });
        }

        const updatedUpdate = await prisma.campaignUpdate.update({
            where: { id },
            data: {
                title,
                content,
                imageUrl,
                tags: tags || [],
                isPinned: isPinned || false,
            }
        });

        return NextResponse.json(updatedUpdate);
    } catch (error: any) {
        console.error("[UPDATE_PUT_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/campaigns/[slug]/updates/[id]
 * Xóa một update (Chỉ Creator)
 */
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ slug: string; id: string} }>
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug, id } = await params;

        // Kiểm tra update có tồn tại và thuộc campaign này không
        const update = await prisma.campaignUpdate.findUnique({
            where: { id },
            include: {
                campaign: {
                    select: { id: true, creatorId: true, slug: true }
                }
            }
        });

        if (!update) {
            return NextResponse.json({ error: "Update not found" }, { status: 404 });
        }

        // Kiểm tra slug có khớp không
        if (update.campaign.slug !== slug && update.campaign.id !== slug) {
            return NextResponse.json({ error: "Update does not belong to this campaign" }, { status: 400 });
        }

        // Kiểm tra quyền (phải là chủ dự án)
        if (update.campaign.creatorId !== (session.user as any).id) {
            return NextResponse.json({ error: "Bạn không có quyền xóa cập nhật này" }, { status: 403 });
        }

        await prisma.campaignUpdate.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "Đã xóa cập nhật thành công" });
    } catch (error: any) {
        console.error("[UPDATE_DELETE_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
