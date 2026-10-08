import { PrismaClient } from "../../prisma/generated/client";
import { getDatabaseTarget, setDatabaseTarget, shouldRefreshDatabaseTarget } from "@/lib/db/target";

export { Prisma } from "../../prisma/generated/client";
export type { users } from "../../prisma/generated/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const postgresPrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = postgresPrisma;

export const prisma = postgresPrisma;

export async function refreshDatabaseTarget() {
  if (!shouldRefreshDatabaseTarget()) return getDatabaseTarget();
  try {
    const rows = await postgresPrisma.$queryRawUnsafe<Array<{ value: string }>>(
      "SELECT value FROM platform_settings WHERE key = $1",
      "active_database",
    );
    setDatabaseTarget(rows[0]?.value === "sqlserver" ? "sqlserver" : "postgresql");
  } catch {
    setDatabaseTarget("postgresql");
  }
  return getDatabaseTarget();
}

export default prisma;
