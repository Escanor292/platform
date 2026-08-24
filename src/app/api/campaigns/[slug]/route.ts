import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { projectIdSchema } from "@/lib/project/project.validation";
import {
  checkAuthentication,
  validationErrorResponse,
  forbiddenResponse
} from "@/lib/project/project.response-handlers";
import { z } from "zod";

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
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    // Check authentication
    const session = await auth();
    const authError = checkAuthentication(session);
    if (authError) return authError;

    const userId = session!.user!.id;
    const { slug } = await context.params;
    const body = await req.json();

    const campaign = await prisma.campaigns.findUnique({
      where: { slug },
      select: { id: true, creatorId: true }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Không tìm thấy campaign" },
        { status: 404 }
      );
    }

    // Check ownership
    if (campaign.creatorId !== userId) {
      return forbiddenResponse('Not authorized to update this campaign');
    }

    // Prepare update data
    const updateData: any = {
      title: body.title,
      description: body.tagline || body.description,
      longDescription: body.description || body.longDescription || null,
      goalAmount: body.goalAmount,
      category: body.mainCategory || body.category,
      tags: body.starterTags || body.tags || [],
      imageUrl: body.imageUrl || null,
      images: body.images || [],
      videoUrl: body.videoUrl || null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    };

    // Handle projectId update if provided
    if ('projectId' in body) {
      if (body.projectId === null) {
        // Allow setting to null to make campaign standalone
        updateData.projectId = null;
      } else {
        // Validate projectId format (CUID)
        try {
          projectIdSchema.parse(body.projectId);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return validationErrorResponse('Invalid project ID format');
          }
          throw error;
        }

        // Validate project exists and is owned by campaign owner
        const project = await prisma.projects.findUnique({
          where: { id: body.projectId },
          select: { creatorId: true },
        });

        if (!project) {
          return validationErrorResponse('Project not found');
        }

        if (project.creatorId !== userId) {
          return forbiddenResponse('Not authorized to add campaigns to this project');
        }

        updateData.projectId = body.projectId;
      }
    }

    // Update campaign data
    const updated = await prisma.campaigns.update({
      where: { slug },
      data: updateData,
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
