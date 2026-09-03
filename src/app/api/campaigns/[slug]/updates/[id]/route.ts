import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { persistRichText, RichTextValidationError } from "@/lib/editor/persist";

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ slug: string; id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug, id } = await context.params;
        const { title, content, imageUrl, tags, isPinned } = await req.json();

        const update = await prisma.campaign_updates.findUnique({
            where: { id },
            include: {
                campaigns: {
                    select: { id: true, creatorId: true, slug: true }
                }
            }
        });

        if (!update) {
            return NextResponse.json({ error: "Update not found" }, { status: 404 });
        }

        if (update.campaigns.slug !== slug && update.campaigns.id !== slug) {
            return NextResponse.json({ error: "Update does not belong to this campaign" }, { status: 400 });
        }

        if (update.campaigns.creatorId !== (session.user as any).id) {
            return NextResponse.json({ error: "Bạn không có quyền chỉnh sửa cập nhật này" }, { status: 403 });
        }

        let safeContent = update.content;
        try {
            safeContent = persistRichText(content || "");
        } catch (error) {
            if (error instanceof RichTextValidationError) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            throw error;
        }

        const updatedUpdate = await prisma.campaign_updates.update({
            where: { id },
            data: {
                title,
                content: safeContent,
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

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ slug: string; id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug, id } = await context.params;

        const update = await prisma.campaign_updates.findUnique({
            where: { id },
            include: {
                campaigns: {
                    select: { id: true, creatorId: true, slug: true }
                }
            }
        });

        if (!update) {
            return NextResponse.json({ error: "Update not found" }, { status: 404 });
        }

        if (update.campaigns.slug !== slug && update.campaigns.id !== slug) {
            return NextResponse.json({ error: "Update does not belong to this campaign" }, { status: 400 });
        }

        if (update.campaigns.creatorId !== (session.user as any).id) {
            return NextResponse.json({ error: "Bạn không có quyền xóa cập nhật này" }, { status: 403 });
        }

        await prisma.campaign_updates.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Đã xóa cập nhật thành công" });
    } catch (error: any) {
        console.error("[UPDATE_DELETE_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
