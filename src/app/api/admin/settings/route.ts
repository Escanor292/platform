import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isEkycEnabled, setEkycEnabled } from "@/lib/platform-settings";

function isAdmin(user: unknown) {
  const u = user as { role?: string; isAdmin?: boolean } | undefined;
  return u?.role === "ADMIN" || u?.isAdmin === true;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const ekycEnabled = await isEkycEnabled();
  return NextResponse.json({
    ekycEnabled,
    kycMode: ekycEnabled ? "EKYC" : "MANUAL",
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  if (typeof body.ekycEnabled !== "boolean") {
    return NextResponse.json({ error: "Thiếu ekycEnabled (boolean)." }, { status: 400 });
  }
  const ekycEnabled = await setEkycEnabled(body.ekycEnabled);
  return NextResponse.json({
    success: true,
    ekycEnabled,
    kycMode: ekycEnabled ? "EKYC" : "MANUAL",
  });
}
