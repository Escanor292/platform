import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const { title, tagline, description, goalAmount, category, imageUrl, endDate } = body;

    // Tạo slug từ title đơn giản
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4);

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description: tagline,
        longDescription: description,
        goalAmount,
        category,
        imageUrl,
        endDate: new Date(endDate),
        slug,
        creatorId: (session.user as any).id,
        currentAmount: 0,
        status: "DRAFT",
        campaignCode: "CF" + Math.random().toString(36).substring(2, 7).toUpperCase()
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[POST /api/campaigns]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
