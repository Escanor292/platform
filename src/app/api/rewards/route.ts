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
            return NextResponse.json({ error: "Tỷ lệ cọc phải là số nguyên từ 1% đến 99%" }, { status: 400 });
        }
        const parsedDeliveryDate = deliveryDate ? new Date(deliveryDate) : null;
        if (preorderEnabled && (!parsedDeliveryDate || Number.isNaN(parsedDeliveryDate.getTime()) || parsedDeliveryDate <= new Date())) {
            return NextResponse.json(
                { error: "Sản phẩm đặt trước phải có ngày dự kiến giao hàng trong tương lai" },
                { status: 400 }
            );
        }

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

        // Resolve project linkage
        let resolvedProjectId: string | null = projectId || null;
        let resolvedIncludedInProject = isIncludedInProject === false ? false : true;
        if (campaignId) {
            const campaign = await prisma.campaigns.findFirst({
                where: { id: campaignId },
                select: { projectId: true, creatorId: true },
            });
            if (campaign?.projectId) {
                // Sản phẩm tạo từ chiến dịch: tự động thuộc về dự án của chiến dịch
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

        // Create reward
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

        return NextResponse.json(reward);
    } catch (error) {
        console.error("[POST /api/rewards]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}