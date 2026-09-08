import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { permissionDenied, userHasPermission } from "@/lib/permissions";
import {
  canPublishTemplates,
  canViewTemplate,
  deleteTemplate,
  getSessionUserId,
  getTemplateById,
  updateTemplate,
  type TemplateVisibility,
} from "@/lib/profile-templates";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await auth();
  const template = await getTemplateById(id);
  if (!template || !canViewTemplate(template, session?.user as any)) {
    return NextResponse.json({ error: "Không tìm thấy mẫu." }, { status: 404 });
  }
  return NextResponse.json({ template });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = await getSessionUserId();
  if (!userId || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await userHasPermission(session.user as any, "profile.customize"))) {
    return NextResponse.json(permissionDenied(), { status: 403 });
  }
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  try {
    const template = await updateTemplate(
      id,
      userId,
      {
        title: body.title,
        description: body.description,
        visibility: ["PRIVATE", "UNLISTED", "PUBLIC"].includes(body.visibility)
          ? (body.visibility as TemplateVisibility)
          : undefined,
      },
      {
        isAdmin: (session.user as any).role === "ADMIN" || Boolean((session.user as any).isAdmin),
        canPublish: await canPublishTemplates(session.user as any),
      },
    );
    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Không sửa được mẫu." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  try {
    await deleteTemplate(id, userId, (session?.user as any)?.role === "ADMIN" || Boolean((session?.user as any)?.isAdmin));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Không xóa được mẫu." }, { status: 400 });
  }
}
