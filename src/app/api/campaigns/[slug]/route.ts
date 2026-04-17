import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/campaigns/[slug]
 * Lấy chi tiết campaign theo ID hoặc slug
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        rewards: { orderBy: { amount: "asc" } },
        pledges: {
          where: { isAnonymous: false },
          select: {
            id: true,
            amount: true,
            displayName: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { pledges: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Không tìm thấy campaign" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[GET /api/campaigns/[id]]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

/**
 * PUT /api/campaigns/[slug]
 * Cập nhật campaign (chỉ creator hoặc admin)
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const campaign = await prisma.campaign.findUnique({ where: { slug } });
    if (!campaign) {
      return NextResponse.json(
        { error: "Không tìm thấy campaign" },
        { status: 404 }
      );
    }

    const updated = await prisma.campaign.update({
      where: { slug },
      data: {
        title: body.title,
        description: body.description,
        longDescription: body.longDescription || null,
        goalAmount: body.goalAmount,
        category: body.category,
        imageUrl: body.imageUrl || null,
        images: body.images || [],
        videoUrl: body.videoUrl || null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/campaigns/[slug]]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Xóa campaign (chỉ cho phép nếu DRAFT, không có pledge)
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: slug },
      include: { _count: { select: { pledges: true } } },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Không tìm thấy campaign" },
        { status: 404 }
      );
    }

    if (campaign._count.pledges > 0) {
      return NextResponse.json(
        { error: "Không thể xóa campaign đã có người ủng hộ" },
        { status: 400 }
      );
    }

    await prisma.campaign.delete({ where: { id: slug } });
    return NextResponse.json({ message: "Đã xóa campaign" });
  } catch (error) {
    console.error("[DELETE /api/campaigns/[id]]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
