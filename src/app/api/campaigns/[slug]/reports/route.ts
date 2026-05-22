import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }>;

/**
 * POST /api/campaigns/[slug]/reports
 * Submit a campaign report (chỉ cho logged-in users)
 */
export async function POST(req: NextRequest, { params }: Params) {
    try {
        // 1. Check authentication - REQUIRED
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Bạn cần đăng nhập để báo cáo chiến dịch" },
                { status: 401 }
            );
        }

        const userId = (session.user as any).id;
        const { slug } = await params;
        const { reason, description } = await req.json();

        // 2. Validate input
        if (!reason || !description?.trim()) {
            return NextResponse.json(
                { error: "Vui lòng cung cấp lý do và mô tả chi tiết" },
                { status: 400 }
            );
        }

        // 3. Find campaign
        const campaign = await prisma.campaign.findFirst({
            where: { OR: [{ slug }, { id: slug }] },
            select: { id: true, title: true }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Không tìm thấy chiến dịch" },
                { status: 404 }
            );
        }

        // 4. Check if user already reported this campaign
        const existingReport = await prisma.campaignReport.findFirst({
            where: {
                campaignId: campaign.id,
                userId: userId
            }
        });

        if (existingReport) {
            return NextResponse.json(
                { error: "Bạn đã báo cáo chiến dịch này rồi" },
                { status: 409 }
            );
        }

        // 5. Create report
        const report = await prisma.campaignReport.create({
            data: {
                campaignId: campaign.id,
                userId: userId,
                reason,
                description: description.trim(),
                status: "PENDING"
            },
            include: {
                user: { select: { name: true, email: true } },
                campaign: { select: { title: true } }
            }
        });

        return NextResponse.json(
            {
                message: "Báo cáo của bạn đã được gửi thành công",
                report
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("[CAMPAIGN_REPORT_POST_ERROR]", error);
        return NextResponse.json(
            { error: error.message || "Lỗi khi gửi báo cáo" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/campaigns/[slug]/reports
 * Get reports for a campaign (admin only)
 */
export async function GET(req: NextRequest, { params }: Params) {
    try {
        const session = await auth();

        // Only admins can view reports
        if (!session?.user || !(session.user as any).isAdmin) {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 403 }
            );
        }

        const { slug } = await params;

        const campaign = await prisma.campaign.findFirst({
            where: { OR: [{ slug }, { id: slug }] },
            select: { id: true }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Không tìm thấy chiến dịch" },
                { status: 404 }
            );
        }

        const reports = await prisma.campaignReport.findMany({
            where: { campaignId: campaign.id },
            include: {
                user: { select: { name: true, email: true, avatar: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(reports);
    } catch (error: any) {
        console.error("[CAMPAIGN_REPORT_GET_ERROR]", error);
        return NextResponse.json(
            { error: error.message || "Lỗi khi lấy báo cáo" },
            { status: 500 }
        );
    }
}
