import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isPublicCampaignStatus } from "@/lib/moderation/policy";

export { PUT } from "@/lib/campaign/update-campaign";

export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;

    const campaign = await prisma.campaigns.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        users: { select: { id: true, name: true, avatar: true } },
        rewards: { orderBy: { minAmount: "asc" } },
        pledges: {
          where: { status: "SUCCESS" },
          select: {
            id: true,
            userId: true,
            amount: true,
            displayName: true,
            isAnonymous: true,
            createdAt: true,
            users: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        campaign_blog_links: {
          include: {
            blog_posts: {
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImage: true,
                publishedAt: true,
                viewCount: true,
                likeCount: true,
                commentCount: true,
                users: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            pledges: { where: { status: "SUCCESS" } },
            campaign_followers: true
          }
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Khong tim thay campaign" },
        { status: 404 }
      );
    }

    const session = await auth();
    const user = session?.user as { id?: string; role?: string; isAdmin?: boolean } | undefined;
    const isOwner = !!user?.id && user.id === campaign.creatorId;
    const isAdmin = user?.role === "ADMIN" || user?.isAdmin === true;
    if (!isPublicCampaignStatus(campaign.status) && !isOwner && !isAdmin) {
      return NextResponse.json({ error: "Khong tim thay campaign" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[GET /api/campaigns/[id]]", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;

    const campaign = await prisma.campaigns.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: { _count: { select: { pledges: true } } },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Khong tim thay campaign" },
        { status: 404 }
      );
    }

    if (campaign._count.pledges > 0) {
      return NextResponse.json(
        { error: "Khong the xoa campaign da co nguoi ung ho" },
        { status: 400 }
      );
    }

    await prisma.campaigns.delete({ where: { id: campaign.id } });
    return NextResponse.json({ message: "Da xoa campaign" });
  } catch (error) {
    console.error("[DELETE /api/campaigns/[id]]", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
