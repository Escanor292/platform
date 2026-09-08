import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isCreatorPro, listBrokenLinks, scanCreatorLinks } from "@/lib/link-checks";

async function requirePro() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!(await isCreatorPro(userId))) {
    return { error: NextResponse.json({ error: "Tính năng dành cho Creator Pro.", pro: false }, { status: 403 }) };
  }
  return { userId };
}

export async function GET() {
  const gate = await requirePro();
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
  const gate = await requirePro();
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
