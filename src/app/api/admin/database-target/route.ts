import { spawn } from "child_process";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ACTIVE_DATABASE_KEY, inspectDatabaseReadiness, setDatabaseTarget, type DatabaseTarget } from "@/lib/db/target";
import { getPlatformSetting, setPlatformSetting } from "@/lib/platform-settings";
import { refreshDatabaseTarget } from "@/lib/prisma";

function isAdmin(user: unknown) {
  const account = user as { role?: string; isAdmin?: boolean } | undefined;
  return account?.role === "ADMIN" || account?.isAdmin === true;
}

function normalizeTarget(value: string | null | undefined): DatabaseTarget {
  return value === "sqlserver" || value === "mssql" ? "sqlserver" : "postgresql";
}

function pushSqlServerSchema() {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("npx", ["prisma", "db", "push", "--schema", "prisma/schema.sqlserver.prisma", "--skip-generate", "--accept-data-loss"], {
      env: process.env,
    });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk.toString(); });
    child.stderr.on("data", (chunk) => { output += chunk.toString(); });
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(output.slice(-500) || "Không tạo được bảng MS SQL")));
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await refreshDatabaseTarget();
  const stored = normalizeTarget(await getPlatformSetting(ACTIVE_DATABASE_KEY));
  return NextResponse.json(inspectDatabaseReadiness(stored));
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const requested = normalizeTarget(body.target);
  const current = inspectDatabaseReadiness(normalizeTarget(await getPlatformSetting(ACTIVE_DATABASE_KEY)));
  if (!current.canSwitch) {
    return NextResponse.json({ error: "Chưa gắn MSSQL_URL. Web vẫn dùng Postgres.", ...current, requested }, { status: 409 });
  }
  if (requested === "sqlserver") {
    try { await pushSqlServerSchema(); }
    catch (error) {
      setDatabaseTarget("postgresql");
      return NextResponse.json({ error: error instanceof Error ? error.message : "Không kết nối được MS SQL", ...current }, { status: 409 });
    }
  }
  await setPlatformSetting(ACTIVE_DATABASE_KEY, requested);
  setDatabaseTarget(requested);
  return NextResponse.json({ success: true, ...inspectDatabaseReadiness(requested), requested });
}
