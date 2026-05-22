import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string} }>
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { isActive } = body;

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

        // Update reward status
        const updatedReward = await prisma.reward.update({
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