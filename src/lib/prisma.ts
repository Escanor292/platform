import { PrismaClient } from "../../prisma/generated/client";
import { getDatabaseTarget, shouldRefreshDatabaseTarget, setDatabaseTarget } from "@/lib/db/target";
import { getMssqlClient } from "@/lib/db/mssql-client";
import { packWriteArgs, unpackRead } from "@/lib/db/adapt";

export { Prisma } from "../../prisma/generated/client";
export type { users } from "../../prisma/generated/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const postgresPrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = postgresPrisma;

export async function refreshDatabaseTarget() {
  if (!shouldRefreshDatabaseTarget()) return getDatabaseTarget();
  try {
    const rows = await postgresPrisma.$queryRawUnsafe<Array<{ value: string }>>(
      "SELECT value FROM platform_settings WHERE key = $1",
      "active_database",
    );
    const stored = rows[0]?.value === "sqlserver" ? "sqlserver" : "postgresql";
    setDatabaseTarget(stored === "sqlserver" && getMssqlClient() ? "sqlserver" : "postgresql");
  } catch {
    setDatabaseTarget("postgresql");
  }
  return getDatabaseTarget();
}

function activeClient() {
  if (getDatabaseTarget() !== "sqlserver") return postgresPrisma;
  return getMssqlClient() ?? postgresPrisma;
}

const switchingPrisma = new Proxy(postgresPrisma, {
  get(target, prop) {
    const client = activeClient();
    if (client === target) return Reflect.get(target, prop, target);
    const value = Reflect.get(client, prop, client);
    if (typeof value !== "function") return value;
    return (...args: unknown[]) => {
      const packed = args.map(packWriteArgs);
      const result = value.apply(client, packed);
      return result instanceof Promise ? result.then(unpackRead) : unpackRead(result);
    };
  },
}) as PrismaClient;

export const prisma = process.env.MSSQL_URL?.trim() ? switchingPrisma : postgresPrisma;

export default prisma;
