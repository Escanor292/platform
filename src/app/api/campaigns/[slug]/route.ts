import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/campaigns/[slug]
 * Lấy chi tiết campaign theo ID hoặc slug
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;

    const campaign = await prisma.campaigns.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        users: { select: { id: true, name: true, avatar: true } },
        rewards: { orderBy: { minAmount: "asc" } },
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
            pledges: true,
            campaign_followers: true
          }
        },
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
export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const body = await req.json();

    const campaign = await prisma.campaigns.findUnique({ where: { slug } });
    if (!campaign) {
      return NextResponse.json(
        { error: "Không tìm thấy campaign" },
        { status: 404 }
      );
    }

    // Update campaign data
    const updated = await prisma.campaigns.update({
      where: { slug },
      data: {
        title: body.title,
        description: body.tagline || body.description, // Map tagline to description
        longDescription: body.description || body.longDescription || null, // Map frontend description to longDescription
        goalAmount: body.goalAmount,
        category: body.mainCategory || body.category, // Map mainCategory to category
        tags: body.starterTags || body.tags || [], // Save starterTags to tags
        imageUrl: body.imageUrl || null,
        images: body.images || [],
        videoUrl: body.videoUrl || null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    // Update blog links if provided
    if (body.linkedBlogIds !== undefined) {
      // Delete existing links
      await prisma.campaign_blog_links.deleteMany({
        where: { campaignId: campaign.id },
      });

      // Create new links
      if (Array.isArray(body.linkedBlogIds) && body.linkedBlogIds.length > 0) {
        await prisma.campaign_blog_links.createMany({
          data: body.linkedBlogIds.map((blogId: string, index: number) => ({
            campaignId: campaign.id,
            blogPostId: blogId,
            order: index,
          })),
        });
      }
    }

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
export async function DELETE(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;

    const campaign = await prisma.campaigns.findUnique({
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

    await prisma.campaigns.delete({ where: { id: slug } });
    return NextResponse.json({ message: "Đã xóa campaign" });
  } catch (error) {
    console.error("[DELETE /api/campaigns/[id]]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
