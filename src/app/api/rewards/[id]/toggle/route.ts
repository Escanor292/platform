import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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
        const { isActive } = body;

        // Check if user owns the reward's campaign or project
        const reward = await prisma.rewards.findUnique({
            where: { id },
            include: {
                campaigns: {
                    select: {
                        creatorId: true,
                    },
                },
                projects: {
                    select: {
                        creatorId: true,
                    },
                },
            },
        });

        if (!reward) {
            return NextResponse.json({ error: "Reward not found" }, { status: 404 });
        }

        const ownerIds = [
            reward.campaigns?.creatorId,
            reward.projects?.creatorId,
        ].filter(Boolean);

        if (ownerIds.length === 0 || !ownerIds.includes((session.user as any).id)) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Update reward status
        const updatedReward = await prisma.rewards.update({
            where: { id },
            data: {
                isActive: Boolean(isActive),
            },
        });

        return NextResponse.json(updatedReward);
    } catch (error) {
        console.error("[PATCH /api/rewards/[id]/toggle]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}