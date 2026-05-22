import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/campaigns/[slug]/updates
 * Lấy lịch sử cập nhật của dự án với tìm kiếm và filter
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string} }>
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";

    const campaign = await prisma.campaign.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Build where clause
    const where: any = { campaignId: campaign.id };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } }
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const updates = await prisma.campaignUpdate.findMany({
      where,
      orderBy: [
        { isPinned: "desc" }, // Ghim lên đầu
        { createdAt: "desc" }  // Mới nhất
      ]
    });

    return NextResponse.json(updates);
  } catch (error: any) {
    console.error("[UPDATES_GET_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/campaigns/[slug]/updates
 * Đăng tin cập nhật mới (Chỉ Creator)
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string} }>
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { title, content, imageUrl, tags, isPinned } = await req.json();

    const campaign = await prisma.campaign.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true, creatorId: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Kiểm tra quyền (phải là chủ dự án)
    if (campaign.creatorId !== (session.user as any).id) {
      return NextResponse.json({ error: "Bạn không có quyền đăng cập nhật cho dự án này" }, { status: 403 });
    }

    const update = await prisma.campaignUpdate.create({
      data: {
        campaignId: campaign.id,
        title,
        content,
        imageUrl,
        tags: tags || [],
        isPinned: isPinned || false,
      }
    });

    return NextResponse.json(update);
  } catch (error: any) {
    console.error("[UPDATES_POST_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
