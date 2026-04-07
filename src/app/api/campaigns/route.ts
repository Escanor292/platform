import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/campaigns
 * Lấy danh sách campaign (có filter, pagination)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "ACTIVE";
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { id: true, name: true, image: true } },
          _count: { select: { pledges: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/campaigns]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

/**
 * POST /api/campaigns
 * Tạo campaign mới (yêu cầu đăng nhập với role CREATOR)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      tagline,
      description,
      goalAmount,
      category,
      imageUrl,
      endDate,
      creatorId,
      rewards,
    } = body;

    if (!title || !goalAmount || !creatorId) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Tạo slug từ title
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .concat("-", Date.now().toString(36));

    const campaign = await prisma.campaign.create({
      data: {
        title,
        slug,
        tagline,
        description,
        goalAmount,
        category,
        imageUrl,
        endDate: endDate ? new Date(endDate) : undefined,
        creatorId,
        status: "DRAFT",
        rewards: rewards
          ? {
              create: rewards.map((r: Record<string, unknown>) => ({
                title: r.title,
                description: r.description,
                amount: r.amount,
                stock: r.stock,
                isUnlimited: r.isUnlimited ?? true,
                estimatedDelivery: r.estimatedDelivery,
              })),
            }
          : undefined,
      },
      include: { rewards: true },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("[POST /api/campaigns]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
