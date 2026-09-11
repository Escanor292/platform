import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionDenied, userHasPermission } from "@/lib/permissions";
import {
  canPublishTemplates,
  createTemplate,
  getSessionUserId,
  listMine,
  listPublic,
  sharePublishedAsUnlisted,
  type TemplateVisibility,
} from "@/lib/profile-templates";
import { DEFAULT_PROFILE_CUSTOMIZATION, normalizeProfileCustomization } from "@/lib/profile-customization";

export async function GET(request: NextRequest) {
  const session = await auth();
  const scope = request.nextUrl.searchParams.get("scope") || "public";
  if (scope === "mine") {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await userHasPermission(session?.user as any, "profile.customize"))) {
      return NextResponse.json(permissionDenied("Tài khoản này không được tùy chỉnh giao diện."), { status: 403 });
    }
    return NextResponse.json({ templates: await listMine(userId) });
  }
  return NextResponse.json({ templates: await listPublic() });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = await getSessionUserId();
  if (!userId || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await userHasPermission(session.user as any, "profile.customize"))) {
    return NextResponse.json(permissionDenied("Tài khoản này không được tùy chỉnh giao diện."), { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const visibility = (["PRIVATE", "UNLISTED", "PUBLIC"].includes(body.visibility) ? body.visibility : "PRIVATE") as TemplateVisibility;
  let source = body.config;
  if (body.fromPublished) {
    const existing = await prisma.profile_customizations.findUnique({ where: { userId } });
    source = existing?.publishedConfig || DEFAULT_PROFILE_CUSTOMIZATION;
  }
  try {
    const config = normalizeProfileCustomization(source);
    if (body.fromPublished && visibility !== "PUBLIC") {
      const template = await sharePublishedAsUnlisted({
        authorId: userId,
        title: body.title,
        config,
      });
      return NextResponse.json({ success: true, template });
    }
    const template = await createTemplate({
      authorId: userId,
      title: body.title,
      description: body.description,
      visibility,
      config,
      canPublish: await canPublishTemplates(session.user as any),
      isAdmin: (session.user as any).role === "ADMIN" || Boolean((session.user as any).isAdmin),
    });
    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Không lưu được mẫu." }, { status: 400 });
  }
}