import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listBrokenLinks, scanCreatorLinks } from "@/lib/link-checks";
import { permissionDenied, userHasPermission } from "@/lib/permissions";

async function requireLinkHealth() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!(await userHasPermission(session!.user, "link.health"))) {
    return { error: NextResponse.json({ ...permissionDenied("Tính năng dành cho tài khoản được cấp quyền cảnh báo link hỏng."), pro: false }, { status: 403 }) };
  }
  return { userId };
}

export async function GET() {
  const gate = await requireLinkHealth();
  if ("error" in gate && gate.error) return gate.error;
  const rows = await listBrokenLinks(gate.userId!);
  return NextResponse.json({
    pro: true,
    links: rows.map((row) => ({
      id: row.id,
      type: row.entity_type,
      title: row.entity_title,
      path: row.entity_path,
      url: row.url,
      httpStatus: row.http_status,
      checkedAt: row.last_checked_at,
    })),
  });
}

export async function POST() {
  const gate = await requireLinkHealth();
  if ("error" in gate && gate.error) return gate.error;
  const result = await scanCreatorLinks({ ownerId: gate.userId, limit: 15 });
  const rows = await listBrokenLinks(gate.userId!);
  return NextResponse.json({
    pro: true,
    ...result,
    links: rows.map((row) => ({
      id: row.id,
      type: row.entity_type,
      title: row.entity_title,
      path: row.entity_path,
      url: row.url,
      httpStatus: row.http_status,
      checkedAt: row.last_checked_at,
    })),
  });
}
