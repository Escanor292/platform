import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyticsService } from "@/services/mongodb";

function isAdminSession(user: { role?: string; isAdmin?: boolean } | null | undefined) {
  return user?.role === "ADMIN" || user?.isAdmin === true;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminSession(session.user as { role?: string; isAdmin?: boolean })) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const daysRaw = Number(request.nextUrl.searchParams.get("days") ?? "7");
    const days = Number.isFinite(daysRaw) ? Math.min(90, Math.max(1, Math.round(daysRaw))) : 7;
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const stats = await analyticsService.getBehaviorStats(fromDate);

    return NextResponse.json({
      days,
      enabled: analyticsService.isFeatureEnabled(),
      ...stats,
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics/behavior]", error);
    return NextResponse.json({ error: "Khong the lay thong ke hanh vi." }, { status: 500 });
  }
}
