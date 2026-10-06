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

function callOnActive(owner: object, fn: (...args: unknown[]) => unknown, args: unknown[]) {
  if (owner === postgresPrisma || getDatabaseTarget() !== "sqlserver") return fn.apply(owner, args);
  const result = fn.apply(owner, args.map(packWriteArgs));
  return result instanceof Promise ? result.then(unpackRead) : unpackRead(result);
}

function bindCall(model: PropertyKey, method: PropertyKey) {
  return async (...args: unknown[]) => {
    if (shouldRefreshDatabaseTarget()) await refreshDatabaseTarget();
    const client = activeClient() as Record<PropertyKey, unknown>;
    if (method === model) {
      const fn = client[model];
      if (typeof fn !== "function") return fn;
      return callOnActive(client, fn as (...args: unknown[]) => unknown, args);
    }
    const delegate = client[model] as Record<PropertyKey, unknown> | undefined;
    const fn = delegate?.[method];
    if (typeof fn !== "function" || !delegate) return undefined;
    return callOnActive(delegate, fn as (...args: unknown[]) => unknown, args);
  };
}

const switchingPrisma = new Proxy(postgresPrisma, {
  get(target, prop) {
    if (prop === "then") return undefined;
    const sample = Reflect.get(target, prop, target);
    if (typeof sample === "function") return bindCall(prop, prop);
    if (!sample || typeof sample !== "object") return sample;
    return new Proxy(sample, {
      get(_delegate, method) {
        if (typeof method === "symbol") return Reflect.get(sample, method, sample);
        return bindCall(prop, method);
      },
    });
  },
}) as PrismaClient;

export const prisma = process.env.MSSQL_URL?.trim() ? switchingPrisma : postgresPrisma;

export default prisma;
