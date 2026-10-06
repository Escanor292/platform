import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ACTIVE_DATABASE_KEY, inspectDatabaseReadiness, type DatabaseTarget } from "@/lib/db/target";
import { getPlatformSetting } from "@/lib/platform-settings";

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
  const readiness = inspectDatabaseReadiness(stored);
  return NextResponse.json(readiness);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const requested = normalizeTarget(body.target);
  const stored = normalizeTarget(await getPlatformSetting(ACTIVE_DATABASE_KEY));
  const readiness = inspectDatabaseReadiness(stored);
  if (!readiness.canSwitch) {
    return NextResponse.json(
      {
        error: "Chưa chuyển database. Neon vẫn đang ghi.",
        ...readiness,
        requested,
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ ...readiness, requested });
}
