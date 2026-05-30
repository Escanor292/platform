import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/reports
 * Get all campaign reports (admin only)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // Check if user is authenticated and is admin
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!(session.user as any).isAdmin) {
            return NextResponse.json(
                { error: "Forbidden - Admin only" },
                { status: 403 }
            );
        }

        // Get all reports with campaign and user info
        const reports = await prisma.campaign_reports.findMany({
            include: {
                campaigns: { select: { id: true, title: true, slug: true } },
                users: { select: { name: true, email: true } }
            },
            orderBy: [
                { status: "asc" }, // PENDING first
                { createdAt: "desc" }
            ]
        });

        return NextResponse.json(reports);
    } catch (error: any) {
        console.error("[ADMIN_REPORTS_GET_ERROR]", error);
        return NextResponse.json(
            { error: error.message || "Lỗi khi lấy báo cáo" },
            { status: 500 }
        );
    }
}
