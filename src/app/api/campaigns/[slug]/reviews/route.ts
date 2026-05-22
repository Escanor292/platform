import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/campaigns/[slug]/reviews
 * Lấy danh sách bình luận
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<Promise<{ slug: string> }> }
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

    const reviews = await prisma.review.findMany({
      where: { campaignId: campaign.id },
      include: {
        user: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("[REVIEWS_GET_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/campaigns/[slug]/reviews
 * Đăng bình luận mới
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<Promise<{ slug: string> }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { comment, imageUrl, rating } = await req.json();

    const campaign = await prisma.campaign.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        campaignId: campaign.id,
        userId: (session.user as any).id,
        comment,
        imageUrl,
        rating: rating || 5,
      },
      include: {
        user: { select: { name: true, avatar: true } }
      }
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("[REVIEWS_POST_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
