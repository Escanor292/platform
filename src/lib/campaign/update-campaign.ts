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
import { campaignHasSellableRewards } from "@/lib/funding-model";
import { parseCampaignType, resolveCampaignTaxonomyInput } from "@/lib/taxonomy-write";
import { cacheInvalidatePrefix, CAMPAIGNS_CACHE_PREFIX } from "@/lib/redis-cache";
import { applyFundingModelUpdate } from "@/lib/campaign/apply-funding-model-update";

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
      select: {
        id: true,
        creatorId: true,
        slug: true,
        status: true,
        fundingModel: true,
        type: true,
        _count: { select: { rewards: true } },
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Khong tim thay campaign" }, { status: 404 });
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

    const taxonomy = resolveCampaignTaxonomyInput(body);
    if ("error" in taxonomy) return validationErrorResponse(taxonomy.error);

    const hasProducts = campaignHasSellableRewards(campaign._count.rewards);

    const updateData: any = {
      title: body.title,
      description: body.tagline || body.description,
      longDescription: longDescription || null,
      goalAmount: body.goalAmount,
      category: taxonomy.category,
      tags: taxonomy.tags,
      imageUrl: body.imageUrl || null,
      images: body.images || [],
      videoUrl: body.videoUrl || null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    };

    if (body.type !== undefined || body.campaignType !== undefined) {
      const campaignType = parseCampaignType(body.type || body.campaignType);
      if (!campaignType) return validationErrorResponse("Loai chien dich khong hop le");
      updateData.type = campaignType;
    }

    const funding = applyFundingModelUpdate({
      requestedModel: body.fundingModel,
      currentModel: campaign.fundingModel,
      status: campaign.status,
      hasProducts,
    });
    if (!funding.ok) return validationErrorResponse(funding.error);
    if (funding.fundingModel) updateData.fundingModel = funding.fundingModel;

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

    await cacheInvalidatePrefix(CAMPAIGNS_CACHE_PREFIX).catch(() => undefined);

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
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
