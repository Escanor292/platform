import { prisma } from "@/lib/prisma";
import { getDatabaseTarget } from "@/lib/db/target";
import { getMssqlClient } from "@/lib/db/mssql-client";
import { toDialect } from "@/lib/sql/dialect";

function activeRaw() {
  if (getDatabaseTarget() !== "sqlserver") return { client: prisma, provider: "postgresql" as const };
  const mssql = getMssqlClient();
  if (!mssql) return { client: prisma, provider: "postgresql" as const };
  return { client: mssql, provider: "sqlserver" as const };
}

export function executeRaw(sql: string, ...params: unknown[]): Promise<number> {
  const active = activeRaw();
  const text = active.provider === "postgresql" ? sql : toDialect(sql, "sqlserver");
  return active.client.$executeRawUnsafe(text, ...params);
}

export function queryRaw<T = unknown>(sql: string, ...params: unknown[]): Promise<T> {
  const active = activeRaw();
  const text = active.provider === "postgresql" ? sql : toDialect(sql, "sqlserver");
  return active.client.$queryRawUnsafe<T>(text, ...params);
}
