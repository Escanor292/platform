import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/campaigns/[slug]/reports
 * Submit a campaign report (chỉ cho logged-in users)
 */
export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        // 1. Check authentication - REQUIRED
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Bạn cần đăng nhập để báo cáo chiến dịch" },
                { status: 401 }
            );
        }

        const userId = (session.user as any).id;
        const { reason, description, imageUrls, occurredAt } = await req.json();

        // 2. Validate input
        if (!reason || !description?.trim()) {
            return NextResponse.json(
                { error: "Vui lòng cung cấp lý do và mô tả chi tiết" },
                { status: 400 }
            );
        }

        const images = Array.isArray(imageUrls)
            ? imageUrls.filter((url: unknown) => typeof url === "string" && /^https?:\/\//.test(url)).slice(0, 5)
            : [];
        let incidentAt: Date | null = null;
        if (typeof occurredAt === "string" && occurredAt.trim()) {
            const parsed = new Date(occurredAt);
            if (Number.isNaN(parsed.getTime())) {
                return NextResponse.json({ error: "Thời gian vụ việc không hợp lệ" }, { status: 400 });
            }
            incidentAt = parsed;
        }

        // 3. Find campaign
        const campaign = await prisma.campaigns.findFirst({
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
        const existingReport = await prisma.campaign_reports.findFirst({
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
        const report = await prisma.campaign_reports.create({
            data: {
                id: crypto.randomUUID(),
                campaignId: campaign.id,
                userId: userId,
                reason,
                description: description.trim(),
                imageUrls: images,
                occurredAt: incidentAt,
                status: "PENDING",
                updatedAt: new Date()
            },
            include: {
                users: { select: { name: true, email: true } },
                campaigns: { select: { title: true } }
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
export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        const session = await auth();

        // Only admins can view reports
        if (!session?.user || !(session.user as any).isAdmin) {
            return NextResponse.json(
                { error: "Không có quyền truy cập" },
                { status: 403 }
            );
        }

        const campaign = await prisma.campaigns.findFirst({
            where: { OR: [{ slug }, { id: slug }] },
            select: { id: true }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Không tìm thấy chiến dịch" },
                { status: 404 }
            );
        }

        const reports = await prisma.campaign_reports.findMany({
            where: { campaignId: campaign.id },
            include: {
                users: { select: { name: true, email: true, avatar: true } }
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
