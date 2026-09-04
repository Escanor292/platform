import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateReportEvidence } from "@/lib/content-report";

/**
 * POST /api/campaigns/[slug]/reports
 * Submit a campaign report (chỉ cho logged-in users)
 */
export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Bạn cần đăng nhập để báo cáo chiến dịch" },
                { status: 401 }
            );
        }

        const userId = (session.user as any).id;
        const { reason, description, imageUrls, occurredAt } = await req.json();

        if (!reason || !description?.trim()) {
            return NextResponse.json(
                { error: "Vui lòng cung cấp lý do và mô tả chi tiết" },
                { status: 400 }
            );
        }

        const evidence = validateReportEvidence(imageUrls, occurredAt);
        if (!evidence.ok) {
            return NextResponse.json({ error: evidence.error }, { status: 400 });
        }

        const campaign = await prisma.campaigns.findFirst({
            where: { OR: [{ slug }, { id: slug }] },
            select: { id: true, title: true, slug: true }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Không tìm thấy chiến dịch" },
                { status: 404 }
            );
        }

        const existingReport = await prisma.campaign_reports.findFirst({
            where: {
                targetType: "CAMPAIGN",
                targetId: campaign.id,
                userId,
            }
        });

        if (existingReport) {
            return NextResponse.json(
                { error: "Bạn đã báo cáo chiến dịch này rồi" },
                { status: 409 }
            );
        }

        const report = await prisma.campaign_reports.create({
            data: {
                id: crypto.randomUUID(),
                campaignId: campaign.id,
                targetType: "CAMPAIGN",
                targetId: campaign.id,
                targetTitle: campaign.title,
                targetHref: `/campaigns/${campaign.slug}`,
                userId,
                reason,
                description: description.trim(),
                imageUrls: evidence.images,
                occurredAt: evidence.occurredAt,
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

        if (!session?.user || ((session.user as any).role !== "ADMIN" && !(session.user as any).isAdmin)) {
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
            where: { targetType: "CAMPAIGN", targetId: campaign.id },
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