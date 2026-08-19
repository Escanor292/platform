import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            campaignId,
            projectId,
            title,
            description,
            minAmount,
            maxAmount,
            stock,
            productImages,
            productVideo,
            maxQuantity,
            deliveryDate,
            isActive
        } = body;

        // Validate required fields
        if (!title || !minAmount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate campaign ownership if provided
        const resolvedCampaignId = campaignId;
        if (campaignId) {
            const campaign = await prisma.campaigns.findFirst({
                where: {
                    id: campaignId,
                    creatorId: (session.user as any).id,
                },
            });
            if (!campaign) {
                return NextResponse.json(
                    { error: "Campaign not found or access denied" },
                    { status: 404 }
                );
            }
        }

        // Validate project ownership if provided
        if (projectId) {
            const project = await prisma.projects.findFirst({
                where: {
                    id: projectId,
                    creatorId: (session.user as any).id,
                },
            });
            if (!project) {
                return NextResponse.json(
                    { error: "Project not found or access denied" },
                    { status: 404 }
                );
            }
        }

        // Create reward
        const reward = await prisma.rewards.create({
            data: {
                id: crypto.randomUUID(),
                campaignId: resolvedCampaignId as string,
                projectId: projectId || null,
                title,
                description,
                minAmount: parseFloat(minAmount),
                maxAmount: maxAmount !== undefined && maxAmount !== null ? parseFloat(maxAmount) : null,
                stock: stock !== undefined && stock !== null ? parseInt(stock) : null,
                productImages: Array.isArray(productImages) ? productImages : [],
                productVideo: productVideo || null,
                maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                isActive: Boolean(isActive),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(reward);
    } catch (error) {
        console.error("[POST /api/rewards]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}