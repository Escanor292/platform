import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ANALYTICS_TTL_OPTIONS, analyticsService } from "@/services/mongodb/analytics.service";

function isAdminSession(user: { role?: string; isAdmin?: boolean } | null | undefined) {
  return user?.role === "ADMIN" || user?.isAdmin === true;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isAdminSession(session.user as { role?: string; isAdmin?: boolean })) {
    return { error: NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 }) };
  }
  return { session };
}

export async function GET(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if ("error" in gate && gate.error) return gate.error;

    const daysRaw = Number(request.nextUrl.searchParams.get("days") ?? "7");
    const days = Number.isFinite(daysRaw) ? Math.min(90, Math.max(1, Math.round(daysRaw))) : 7;
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const stats = await analyticsService.getBehaviorStats(fromDate);

    return NextResponse.json({
      days,
      enabled: analyticsService.isFeatureEnabled(),
      ttlOptions: ANALYTICS_TTL_OPTIONS,
      ...stats,
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics/behavior]", error);
    return NextResponse.json({ error: "Khong the lay thong ke hanh vi." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if ("error" in gate && gate.error) return gate.error;

    const body = await request.json().catch(() => ({}));
    const ttlDays = Number(body.ttlDays);
    if (!(ANALYTICS_TTL_OPTIONS as readonly number[]).includes(ttlDays)) {
      return NextResponse.json({ error: "TTL phai la 30, 90, 180 hoac 365 ngay." }, { status: 400 });
    }

    const userId = (gate.session?.user as { id?: string } | undefined)?.id;
    const result = await analyticsService.setTtlDays(ttlDays, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[PATCH /api/admin/analytics/behavior]", error);
    return NextResponse.json({ error: "Khong the cap nhat TTL." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if ("error" in gate && gate.error) return gate.error;

    const body = await request.json().catch(() => ({}));
    const all = body.all === true;
    const confirm = typeof body.confirm === "string" ? body.confirm : "";

    if (all && confirm !== "DELETE_ALL") {
      return NextResponse.json({ error: "Go DELETE_ALL de xoa toan bo event hanh vi." }, { status: 400 });
    }
    if (!all && confirm !== "DELETE") {
      return NextResponse.json({ error: "Go DELETE de xac nhan xoa." }, { status: 400 });
    }

    const eventNames = Array.isArray(body.eventNames)
      ? body.eventNames.filter((name: unknown) => typeof name === "string")
      : undefined;
    const beforeDaysRaw = Number(body.beforeDays);
    const beforeDays = Number.isFinite(beforeDaysRaw) ? Math.min(365, Math.max(1, Math.round(beforeDaysRaw))) : 30;
    const beforeDate = all ? undefined : new Date(Date.now() - beforeDays * 24 * 60 * 60 * 1000);

    const result = await analyticsService.purgeEvents({ all, beforeDate, eventNames });
    return NextResponse.json({ ...result, all, beforeDays: all ? null : beforeDays });
  } catch (error) {
    console.error("[DELETE /api/admin/analytics/behavior]", error);
    return NextResponse.json({ error: "Khong the xoa du lieu hanh vi." }, { status: 500 });
  }
}
