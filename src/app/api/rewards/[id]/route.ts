import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string} }>
) {
    try {
        const { id } = await context.params;

        const reward = await prisma.reward.findUnique({
            where: { id },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        creatorId: true,
                    },
                },
                _count: {
                    select: {
                        pledges: true,
                    },
                },
            },
        });

        if (!reward) {
            return NextResponse.json({ error: "Reward not found" }, { status: 404 });
        }

        return NextResponse.json(reward);
    } catch (error) {
        console.error("[GET /api/rewards/[id]]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string} }>
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await req.json();
        const {
            title,
            description,
            minAmount,
            maxQuantity,
            deliveryDate,
            isActive
        } = body;

        // Check if user owns the reward's campaign
        const reward = await prisma.reward.findUnique({
            where: { id },
            include: {
                campaign: {
                    select: {
                        creatorId: true,
                    },
                },
            },
        });

        if (!reward) {
            return NextResponse.json({ error: "Reward not found" }, { status: 404 });
        }

        if (reward.campaign.creatorId !== (session.user as any).id) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Update reward
        const updatedReward = await prisma.reward.update({
            where: { id },
            data: {
                title,
                description,
                minAmount: minAmount ? parseFloat(minAmount) : undefined,
                maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined,
            },
        });

        return NextResponse.json(updatedReward);
    } catch (error) {
        console.error("[PUT /api/rewards/[id]]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string} }>
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;

        // Check if user owns the reward's campaign
        const reward = await prisma.reward.findUnique({
            where: { id },
            include: {
                campaign: {
                    select: {
                        creatorId: true,
                    },
                },
                _count: {
                    select: {
                        pledges: true,
                    },
                },
            },
        });

        if (!reward) {
            return NextResponse.json({ error: "Reward not found" }, { status: 404 });
        }

        if (reward.campaign.creatorId !== (session.user as any).id) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Check if reward has pledges
        if (reward._count.pledges > 0) {
            return NextResponse.json(
                { error: "Cannot delete reward with existing pledges" },
                { status: 400 }
            );
        }

        // Delete reward
        await prisma.reward.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/rewards/[id]]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}