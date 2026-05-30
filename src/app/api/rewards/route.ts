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
            title,
            description,
            minAmount,
            maxQuantity,
            deliveryDate,
            isActive
        } = body;

        // Validate required fields
        if (!campaignId || !title || !minAmount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user owns the campaign
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

        // Create reward
        const reward = await prisma.rewards.create({
            data: {
                id: crypto.randomUUID(),
                campaignId,
                title,
                description,
                minAmount: parseFloat(minAmount),
                maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                isActive: Boolean(isActive),
                updatedAt: new Date(),
                campaigns: {
                    connect: {
                        id: campaignId,
                    },
                },
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