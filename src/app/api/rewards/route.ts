import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertCleanContent } from "@/lib/moderation";

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
            isActive,
            isIncludedInProject,
            availability,
            fulfillmentType,
            isPreorder,
            onlineDepositPercent,
            codDepositPercent
        } = body;

        const allowedFulfillmentTypes = ["PHYSICAL", "EMAIL", "DOWNLOAD", "LICENSE_KEY", "DIGITAL_COMIC"] as const;
        const normalizedFulfillmentType = allowedFulfillmentTypes.includes(fulfillmentType) ? fulfillmentType : "PHYSICAL";

        const preorderEnabled = isPreorder === true;
        const parseDepositPercent = (value: unknown, fallback: number) => {
            if (value === undefined || value === null || value === '') return fallback;
            const parsed = Number(value);
            return Number.isInteger(parsed) && parsed >= 1 && parsed <= 99 ? parsed : null;
        };
        const normalizedOnlineDepositPercent = parseDepositPercent(onlineDepositPercent, 30);
        const normalizedCodDepositPercent = parseDepositPercent(codDepositPercent, 50);
        if (normalizedOnlineDepositPercent === null || normalizedCodDepositPercent === null) {
            return NextResponse.json({ error: "Ty le coc phai la so nguyen tu 1% den 99%" }, { status: 400 });
        }
        const parsedDeliveryDate = deliveryDate ? new Date(deliveryDate) : null;
        if (preorderEnabled && (!parsedDeliveryDate || Number.isNaN(parsedDeliveryDate.getTime()) || parsedDeliveryDate <= new Date())) {
            return NextResponse.json(
                { error: "San pham dat truoc phai co ngay du kien giao hang trong tuong lai" },
                { status: 400 }
            );
        }

        if (!title || !minAmount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!campaignId && !projectId) {
            return NextResponse.json(
                { error: "Can them chien dich hoac du an de tao san pham" },
                { status: 400 }
            );
        }

        try {
            await assertCleanContent([title, description]);
        } catch (error: any) {
            return NextResponse.json({ error: error.message || "Noi dung chua tu bi cam" }, { status: 400 });
        }

        const resolvedCampaignId = campaignId;
        if (campaignId) {
            const campaign = await prisma.campaigns.findFirst({
                where: {
                    id: campaignId,
                    creatorId: (session.user as any).id,
                },
                select: { id: true, projectId: true, creatorId: true },
            });
            if (!campaign) {
                return NextResponse.json(
                    { error: "Campaign not found or access denied" },
                    { status: 404 }
                );
            }
        }

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

        let resolvedProjectId: string | null = projectId || null;
        let resolvedIncludedInProject = isIncludedInProject === false ? false : true;
        if (campaignId) {
            const campaign = await prisma.campaigns.findFirst({
                where: { id: campaignId },
                select: { projectId: true, creatorId: true },
            });
            if (campaign?.projectId) {
                if (resolvedIncludedInProject) {
                    resolvedProjectId = campaign.projectId;
                }
            } else {
                resolvedIncludedInProject = false;
                resolvedProjectId = null;
            }
        } else if (resolvedIncludedInProject && !resolvedProjectId) {
            resolvedIncludedInProject = false;
        }

        const reward = await prisma.rewards.create({
            data: {
                id: crypto.randomUUID(),
                campaignId: resolvedCampaignId || undefined,
                projectId: resolvedProjectId || undefined,
                isIncludedInProject: resolvedIncludedInProject,
                title,
                description,
                minAmount: parseFloat(minAmount),
                maxAmount: maxAmount !== undefined && maxAmount !== null ? parseFloat(maxAmount) : null,
                stock: stock !== undefined && stock !== null ? parseInt(stock) : null,
                productImages: Array.isArray(productImages) ? productImages : [],
                productVideo: productVideo || null,
                maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
                deliveryDate: preorderEnabled ? parsedDeliveryDate : null,
                isPreorder: preorderEnabled,
                onlineDepositPercent: normalizedOnlineDepositPercent,
                codDepositPercent: normalizedCodDepositPercent,
                isActive: Boolean(isActive),
                availability: availability === "DEVELOPMENT" ? "DEVELOPMENT" : "AVAILABLE",
                fulfillmentType: normalizedFulfillmentType,
                updatedAt: new Date(),
            },
        });

        if (resolvedProjectId) {
            await prisma.project_reward_links.upsert({
                where: {
                    projectId_rewardId: {
                        projectId: resolvedProjectId,
                        rewardId: reward.id,
                    },
                },
                create: {
                    projectId: resolvedProjectId,
                    rewardId: reward.id,
                },
                update: {},
            });
        }

        return NextResponse.json({
            ...reward,
        });
    } catch (error) {
        console.error("[POST /api/rewards]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
