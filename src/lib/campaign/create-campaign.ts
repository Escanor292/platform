import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateUniqueCampaignCode, generateUniqueCampaignSlug } from "@/lib/campaign-utils";
import { auth } from "@/lib/auth";
import { projectIdSchema } from "@/lib/project/project.validation";
import {
  checkAuthentication,
  handleServiceError,
  validationErrorResponse,
  forbiddenResponse
} from "@/lib/project/project.response-handlers";
import { z } from "zod";
import { CAMPAIGNS_CACHE_PREFIX, cacheInvalidatePrefix } from "@/lib/redis-cache";
import { persistRichText, RichTextValidationError, isRichTextEmpty } from "@/lib/editor/persist";
import { assertCleanContent } from "@/lib/moderation";
import { permissionDenied, userHasPermission } from "@/lib/permissions";
import { assertFundingModelAllowed, defaultEndDateForType } from "@/lib/funding-model";
import { parseCampaignType, resolveCampaignTaxonomyInput } from "@/lib/taxonomy-write";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const authError = checkAuthentication(session);
    if (authError) return authError;

    const userId = session!.user!.id;
    if (!(await userHasPermission(session!.user, "campaign.create"))) {
      return NextResponse.json(permissionDenied("Tai khoan nay khong duoc tao chien dich."), { status: 403 });
    }
    const body = await req.json();
    const { projectId } = body;

    if (projectId !== undefined && projectId !== null) {
      try {
        projectIdSchema.parse(projectId);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return validationErrorResponse('Invalid project ID');
        }
        throw error;
      }

      const project = await prisma.projects.findUnique({
        where: { id: projectId },
        select: { creatorId: true },
      });

      if (!project) return validationErrorResponse('Invalid project ID');
      if (project.creatorId !== userId) {
        return forbiddenResponse('Not authorized to add campaigns to this project');
      }
    }

    const title = String(body.title || '').trim();
    const tagline = String(body.tagline || '').trim();
    const taxonomy = resolveCampaignTaxonomyInput(body);
    if ("error" in taxonomy) return validationErrorResponse(taxonomy.error);
    const goalAmount = Number(body.goalAmount);
    const campaignType = body.type == null && body.campaignType == null
      ? "REWARD"
      : parseCampaignType(body.type || body.campaignType);
    if (!campaignType) return validationErrorResponse("Loai chien dich khong hop le");
    const requestedModel = body.fundingModel == null
      ? (campaignType === "REWARD" ? "KEEP_IT_ALL" : "ALL_OR_NOTHING")
      : body.fundingModel;
    const fundingCheck = assertFundingModelAllowed({
      fundingModel: requestedModel,
      hasSellableRewards: false,
    });
    if (!fundingCheck.ok) return validationErrorResponse(fundingCheck.error);
    const fundingModel = fundingCheck.model;

    if (!title) return validationErrorResponse('Ten chien dich la bat buoc');
    if (!tagline) return validationErrorResponse('Mo ta ngan la bat buoc');
    if (!goalAmount || goalAmount <= 0) return validationErrorResponse('So von muc tieu khong hop le');

    try {
      await assertCleanContent([title, tagline, body.description, body.richDescription]);
    } catch (error: any) {
      return validationErrorResponse(error.message || 'Noi dung chua tu bi cam');
    }

    let longDescription = '';
    try {
      longDescription = persistRichText(body.description || body.longDescription || '');
    } catch (error) {
      if (error instanceof RichTextValidationError) {
        return validationErrorResponse(error.message);
      }
      throw error;
    }

    if (isRichTextEmpty(longDescription)) {
      return validationErrorResponse('Noi dung chi tiet la bat buoc');
    }

    const [campaignCode, slug] = await Promise.all([
      generateUniqueCampaignCode(),
      generateUniqueCampaignSlug(title),
    ]);

    const campaign = await prisma.campaigns.create({
      data: {
        id: crypto.randomUUID(),
        campaignCode,
        slug,
        title,
        description: tagline,
        longDescription,
        goalAmount,
        type: campaignType,
        category: taxonomy.category,
        tags: taxonomy.tags,
        fundingModel,
        imageUrl: body.imageUrl || null,
        images: body.images || [],
        videoUrl: body.videoUrl || null,
        endDate: body.endDate ? new Date(body.endDate) : defaultEndDateForType(campaignType),
        creatorId: userId as string,
        projectId: projectId || null,
        updatedAt: new Date(),
      },
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

    await cacheInvalidatePrefix(CAMPAIGNS_CACHE_PREFIX);
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("[POST /api/campaigns]", error);
    return handleServiceError(error);
  }
}
