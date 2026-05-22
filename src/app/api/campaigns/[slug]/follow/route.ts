import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/campaigns/[slug]/follow
 * Follow a campaign (quan tâm dự án)
 */
export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        const session = await auth();
        const { email } = await req.json();

        // Get campaign
        const campaign = await prisma.campaign.findUnique({
            where: { slug },
            select: { id: true, title: true }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Không tìm thấy chiến dịch" },
                { status: 404 }
            );
        }

        // Check if already following
        const existingFollow = await prisma.campaignFollower.findFirst({
            where: {
                campaignId: campaign.id,
                OR: [
                    { userId: session?.user?.id || null },
                    { email: email || null }
                ]
            }
        });

        if (existingFollow) {
            return NextResponse.json(
                { message: "Bạn đã quan tâm dự án này rồi", isFollowing: true },
                { status: 200 }
            );
        }

        // Create follow
        await prisma.campaignFollower.create({
            data: {
                campaignId: campaign.id,
                userId: session?.user?.id || null,
                email: !session?.user?.id ? email : null
            }
        });

        return NextResponse.json({
            message: "Đã thêm vào danh sách quan tâm",
            isFollowing: true
        });
    } catch (error) {
        console.error("[POST /api/campaigns/[slug]/follow]", error);
        return NextResponse.json(
            { error: "Lỗi server khi theo dõi chiến dịch" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/campaigns/[slug]/follow
 * Unfollow a campaign (bỏ quan tâm)
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        const session = await auth();
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        // Get campaign
        const campaign = await prisma.campaign.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Không tìm thấy chiến dịch" },
                { status: 404 }
            );
        }

        // Delete follow
        await prisma.campaignFollower.deleteMany({
            where: {
                campaignId: campaign.id,
                OR: [
                    { userId: session?.user?.id || undefined },
                    { email: email || undefined }
                ]
            }
        });

        return NextResponse.json({
            message: "Đã bỏ quan tâm",
            isFollowing: false
        });
    } catch (error) {
        console.error("[DELETE /api/campaigns/[slug]/follow]", error);
        return NextResponse.json(
            { error: "Lỗi server khi bỏ theo dõi chiến dịch" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/campaigns/[slug]/follow
 * Check if user is following this campaign
 */
export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        const session = await auth();
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        // Get campaign
        const campaign = await prisma.campaign.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Không tìm thấy chiến dịch" },
                { status: 404 }
            );
        }

        // Check if following
        const isFollowing = await prisma.campaignFollower.findFirst({
            where: {
                campaignId: campaign.id,
                OR: [
                    { userId: session?.user?.id || null },
                    { email: email || null }
                ]
            }
        });

        // Get total followers count
        const followersCount = await prisma.campaignFollower.count({
            where: { campaignId: campaign.id }
        });

        return NextResponse.json({
            isFollowing: !!isFollowing,
            followersCount
        });
    } catch (error) {
        console.error("[GET /api/campaigns/[slug]/follow]", error);
        return NextResponse.json(
            { error: "Lỗi server khi kiểm tra trạng thái theo dõi" },
            { status: 500 }
        );
    }
}