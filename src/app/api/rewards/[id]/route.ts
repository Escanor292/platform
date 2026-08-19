import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const reward = await prisma.rewards.findUnique({
            where: { id },
            include: {
                campaigns: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        creatorId: true,
                        projectId: true,
                        currentAmount: true,
                        goalAmount: true,
                        endDate: true,
                        projects: { select: { id: true, title: true } },
                        imageUrl: true,
                        images: true,
                    },
                },
                projects: { select: { id: true, title: true } },
                pledges: {
                    where: { status: "SUCCESS" },
                    select: { amount: true, createdAt: true },
                    orderBy: { amount: "desc" },
                    take: 1,
                },
                _count: {
                    select: {
                        pledges: { where: { status: "SUCCESS" } },
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
    context: { params: Promise<{ id: string }> }
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
            maxAmount,
            stock,
            productImages,
            productVideo,
            maxQuantity,
            deliveryDate,
            isActive,
            isIncludedInProject
        } = body;

        // Check if user owns the reward's campaign
        const reward = await prisma.rewards.findUnique({
            where: { id },
            include: {
                campaigns: {
                    select: {
                        creatorId: true,
                    },
                },
            },
        });

        if (!reward) {
            return NextResponse.json({ error: "Reward not found" }, { status: 404 });
        }

        if ((reward.campaigns as any).creatorId !== (session.user as any).id) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Đồng bộ project linkage với toggle isIncludedInProject
        let updateProjectId: string | null | undefined = undefined;
        let updateIncludedInProject: boolean | undefined = undefined;
        if (isIncludedInProject !== undefined) {
            updateIncludedInProject = Boolean(isIncludedInProject);
            const campaignProjectId = (reward.campaigns as any).projectId;
            if (campaignProjectId && updateIncludedInProject) {
                updateProjectId = campaignProjectId;
            } else {
                updateProjectId = null;
            }
        }

        // Update reward
        const updatedReward = await prisma.rewards.update({
            where: { id },
            data: {
                title,
                description,
                minAmount: minAmount !== undefined ? parseFloat(minAmount) : undefined,
                maxAmount: maxAmount !== undefined ? (maxAmount ? parseFloat(maxAmount) : null) : undefined,
                stock: stock !== undefined ? (stock ? parseInt(stock) : null) : undefined,
                productImages: Array.isArray(productImages) ? productImages : undefined,
                productVideo: productVideo !== undefined ? (productVideo || null) : undefined,
                maxQuantity: maxQuantity !== undefined ? (maxQuantity ? parseInt(maxQuantity) : null) : undefined,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined,
                ...(updateIncludedInProject !== undefined ? { isIncludedInProject: updateIncludedInProject, projectId: updateProjectId } : {}),
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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;

        // Check if user owns the reward's campaign
        const reward = await prisma.rewards.findUnique({
            where: { id },
            include: {
                campaigns: {
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

        if ((reward.campaigns as any).creatorId !== (session.user as any).id) {
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
        await prisma.rewards.delete({
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