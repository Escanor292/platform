import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdminSession(user: { role?: string; isAdmin?: boolean } | null | undefined) {
  return user?.role === "ADMIN" || user?.isAdmin === true;
}

function serializeReport(report: any) {
  const campaign = report.campaigns;
  return {
    ...report,
    campaign,
    user: report.users,
    targetType: report.targetType || "CAMPAIGN",
    targetTitle: report.targetTitle || campaign?.title || "Nội dung",
    targetHref: report.targetHref || (campaign?.slug ? `/campaigns/${campaign.slug}` : null),
  };
}

/** GET /api/admin/reports */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminSession(session.user as any)) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const reports = await prisma.campaign_reports.findMany({
      include: {
        campaigns: { select: { id: true, title: true, slug: true } },
        users: { select: { name: true, email: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(reports.map((report) => serializeReport(report)));
  } catch (error: any) {
    console.error("[ADMIN_REPORTS_GET_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi lấy báo cáo" },
      { status: 500 },
    );
  }
}

const ALLOWED_REPORT_STATUS = new Set(["PENDING", "REVIEWING", "RESOLVED", "DISMISSED"]);

/** PATCH /api/admin/reports */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isAdminSession(session.user as any)) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";
    const resolution = typeof body.resolution === "string" ? body.resolution.trim() : "";

    if (!id || !ALLOWED_REPORT_STATUS.has(status)) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const existing = await prisma.campaign_reports.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 });
    }

    const closed = status === "RESOLVED" || status === "DISMISSED";
    const updated = await prisma.campaign_reports.update({
      where: { id },
      data: {
        status: status as "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED",
        resolution: resolution || null,
        resolvedAt: closed ? new Date() : null,
        resolvedBy: closed ? (session.user as any).id : null,
      },
      include: {
        campaigns: { select: { id: true, title: true, slug: true } },
        users: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(serializeReport(updated));
  } catch (error: any) {
    console.error("[ADMIN_REPORTS_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Không thể cập nhật báo cáo" },
      { status: 500 },
    );
  }
}
