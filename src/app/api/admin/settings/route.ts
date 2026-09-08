import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getGa4MeasurementId,
  isEkycEnabled,
  setEkycEnabled,
  setGa4MeasurementId,
} from "@/lib/platform-settings";
import { normalizeGa4Id } from "@/lib/seo";

function isAdmin(user: unknown) {
  const u = user as { role?: string; isAdmin?: boolean } | undefined;
  return u?.role === "ADMIN" || u?.isAdmin === true;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [ekycEnabled, ga4MeasurementId] = await Promise.all([
    isEkycEnabled(),
    getGa4MeasurementId(),
  ]);
  return NextResponse.json({
    ekycEnabled,
    kycMode: ekycEnabled ? "EKYC" : "MANUAL",
    ga4MeasurementId: ga4MeasurementId || "",
    ga4Configured: Boolean(ga4MeasurementId),
    sitemapPath: "/sitemap.xml",
    robotsPath: "/robots.txt",
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const hasEkyc = typeof body.ekycEnabled === "boolean";
  const hasGa4 = Object.prototype.hasOwnProperty.call(body, "ga4MeasurementId");
  if (!hasEkyc && !hasGa4) {
    return NextResponse.json({ error: "Không có trường nào để lưu." }, { status: 400 });
  }

  let ekycEnabled = await isEkycEnabled();
  let ga4MeasurementId = await getGa4MeasurementId();

  if (hasEkyc) ekycEnabled = await setEkycEnabled(body.ekycEnabled);
  if (hasGa4) {
    const raw = String(body.ga4MeasurementId || "").trim();
    if (raw && !normalizeGa4Id(raw)) {
      return NextResponse.json({ error: "Measurement ID không hợp lệ. Dùng dạng G-XXXXXXXX." }, { status: 400 });
    }
    ga4MeasurementId = await setGa4MeasurementId(raw);
  }

  return NextResponse.json({
    success: true,
    ekycEnabled,
    kycMode: ekycEnabled ? "EKYC" : "MANUAL",
    ga4MeasurementId: ga4MeasurementId || "",
    ga4Configured: Boolean(ga4MeasurementId),
    sitemapPath: "/sitemap.xml",
    robotsPath: "/robots.txt",
  });
}
