import { prisma } from "@/lib/prisma";
import { getDatabaseTarget } from "@/lib/db/target";
import { toDialect } from "@/lib/sql/dialect";

function sqlForActive(sql: string): string {
  const target = getDatabaseTarget();
  if (target === "postgresql") return sql;
  return toDialect(sql, "sqlserver");
}

export function executeRaw(sql: string, ...params: unknown[]): Promise<number> {
  return prisma.$executeRawUnsafe(sqlForActive(sql), ...params);
}

export function queryRaw<T = unknown>(sql: string, ...params: unknown[]): Promise<T> {
  return prisma.$queryRawUnsafe<T>(sqlForActive(sql), ...params);
}
