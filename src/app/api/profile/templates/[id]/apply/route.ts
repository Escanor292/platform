import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { permissionDenied, userHasPermission } from "@/lib/permissions";
import { applyTemplate, getSessionUserId } from "@/lib/profile-templates";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = await getSessionUserId();
  if (!userId || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await userHasPermission(session.user as any, "profile.customize"))) {
    return NextResponse.json(permissionDenied("Tài khoản này không được tùy chỉnh giao diện."), { status: 403 });
  }
  const { id } = await context.params;
  try {
    const draft = await applyTemplate(id, userId, session.user as any);
    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Không áp dụng được mẫu." }, { status: 400 });
  }
}
