import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateUniqueCampaignCode } from "@/lib/campaign-utils";

/**
 * GET /api/campaigns
 * Danh sách campaigns có filter
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "ACTIVE";
    const q = searchParams.get("q");

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: status as any,
        category: category || undefined,
        OR: q ? [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ] : undefined
      },
      include: {
        creator: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("[GET /api/campaigns]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

/**
 * POST /api/campaigns
 * Tạo mới campaign
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, tagline, description, goalAmount, mainCategory, starterTags, imageUrl, endDate } = body;

    // Validate taxonomy
    if (!mainCategory) {
      return NextResponse.json({ error: "Vui lòng chọn danh mục chính" }, { status: 400 });
    }
    
    if (!starterTags || !Array.isArray(starterTags)) {
      return NextResponse.json({ error: "Thẻ phụ không hợp lệ" }, { status: 400 });
    }
    
    // Không giới hạn số lượng tags nữa
    // if (starterTags.length > 5) {
    //   return NextResponse.json({ error: "Chỉ được chọn tối đa 5 thẻ phụ" }, { status: 400 });
    // }

    // Tạo slug từ title đơn giản
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4);

    // Tạo campaign ID duy nhất
    const campaignCode = await generateUniqueCampaignCode();

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description: tagline,
        longDescription: description,
        goalAmount,
        category: mainCategory, // Store mainCategory in category field
        tags: starterTags, // Store starterTags in tags field (assuming it's a String[] field)
        imageUrl,
        endDate: new Date(endDate),
        slug,
        creatorId: (session.user as any).id,
        currentAmount: 0,
        status: "DRAFT",
        campaignCode
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[POST /api/campaigns]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
