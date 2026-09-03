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
import { persistRichText, RichTextValidationError } from "@/lib/editor/persist";

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

export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const authError = checkAuthentication(session);
    if (authError) return authError;

    const userId = session!.user!.id;
    const { slug } = await context.params;
    const body = await req.json();

    const campaign = await prisma.campaigns.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true, creatorId: true, slug: true }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Không tìm thấy campaign" },
        { status: 404 }
      );
    }

    if (campaign.creatorId !== userId) {
      return forbiddenResponse('Not authorized to update this campaign');
    }

    let longDescription: string | null = null;
    try {
      longDescription = persistRichText(body.description || body.longDescription || '');
    } catch (error) {
      if (error instanceof RichTextValidationError) {
        return validationErrorResponse(error.message);
      }
      throw error;
    }

    const updateData: any = {
      title: body.title,
      description: body.tagline || body.description,
      longDescription: longDescription || null,
      goalAmount: body.goalAmount,
      category: body.mainCategory || body.category,
      tags: body.starterTags || body.tags || [],
      imageUrl: body.imageUrl || null,
      images: body.images || [],
      videoUrl: body.videoUrl || null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    };

    if ('projectId' in body) {
      if (body.projectId === null) {
        updateData.projectId = null;
      } else {
        try {
          projectIdSchema.parse(body.projectId);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return validationErrorResponse('Invalid project ID format');
          }
          throw error;
        }

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

    const updated = await prisma.campaigns.update({
      where: { id: campaign.id },
      data: updateData,
    });

    if (body.linkedBlogIds !== undefined) {
      await prisma.campaign_blog_links.deleteMany({
        where: { campaignId: campaign.id },
      });

      if (Array.isArray(body.linkedBlogIds) && body.linkedBlogIds.length > 0) {
        await prisma.campaign_blog_links.createMany({
          data: body.linkedBlogIds.map((blogId: string, index: number) => ({
            id: crypto.randomUUID(),
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

export async function DELETE(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;

    const campaign = await prisma.campaigns.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
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

    await prisma.campaigns.delete({ where: { id: campaign.id } });
    return NextResponse.json({ message: "Đã xóa campaign" });
  } catch (error) {
    console.error("[DELETE /api/campaigns/[id]]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
