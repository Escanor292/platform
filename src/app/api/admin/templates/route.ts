import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listPending, listPublic, reviewTemplate } from "@/lib/profile-templates";

function isAdmin(user: unknown) {
  const u = user as { role?: string; isAdmin?: boolean } | undefined;
  return u?.role === "ADMIN" || u?.isAdmin === true;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const status = request.nextUrl.searchParams.get("status") || "PENDING";
  const templates = status === "PUBLISHED" ? await listPublic(80) : await listPending(80);
  return NextResponse.json({ templates });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  if (!body.id || (body.action !== "APPROVE" && body.action !== "REJECT")) {
    return NextResponse.json({ error: "Thiếu mẫu hoặc thao tác." }, { status: 400 });
  }
  try {
    const template = await reviewTemplate(body.id, body.action);
    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Không duyệt được mẫu." }, { status: 400 });
  }
}
