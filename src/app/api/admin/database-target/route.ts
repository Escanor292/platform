import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ACTIVE_DATABASE_KEY, inspectDatabaseReadiness, type DatabaseTarget } from "@/lib/db/target";
import { getPlatformSetting, setPlatformSetting } from "@/lib/platform-settings";

function isAdmin(user: unknown) {
  const account = user as { role?: string; isAdmin?: boolean } | undefined;
  return account?.role === "ADMIN" || account?.isAdmin === true;
}

function normalizeTarget(value: string | null | undefined): DatabaseTarget {
  return value === "sqlserver" || value === "mssql" ? "sqlserver" : "postgresql";
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const stored = normalizeTarget(await getPlatformSetting(ACTIVE_DATABASE_KEY));
  return NextResponse.json(inspectDatabaseReadiness(stored));
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const requested = normalizeTarget(body.target);
  const current = inspectDatabaseReadiness(normalizeTarget(await getPlatformSetting(ACTIVE_DATABASE_KEY)));
  if (!current.canSwitch) {
    return NextResponse.json(
      { error: "Chưa gắn SQL Server. Web vẫn dùng Postgres.", ...current, requested },
      { status: 409 },
    );
  }
  await setPlatformSetting(ACTIVE_DATABASE_KEY, requested);
  const readiness = inspectDatabaseReadiness(requested);
  return NextResponse.json({ success: true, ...readiness, requested });
}
