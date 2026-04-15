import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/campaigns/[slug]/updates
 * Lấy lịch sử cập nhật của dự án
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const updates = await prisma.campaignUpdate.findMany({
      where: { campaignId: campaign.id },
      orderBy: { createdAt: "desc" }
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { title, content, imageUrl } = await req.json();

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
      }
    });

    return NextResponse.json(update);
  } catch (error: any) {
    console.error("[UPDATES_POST_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
