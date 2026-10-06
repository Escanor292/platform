import { existsSync } from "fs";
import path from "path";

type SqlClient = {
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<number>;
  $queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
};

const globalForMssql = global as unknown as { mssqlPrisma?: SqlClient };

function runtimeRequire(id: string) {
  return Function("id", "return require(id)")(id) as { PrismaClient: new (args: unknown) => SqlClient };
}

export function getMssqlClient(): SqlClient | null {
  const url = process.env.MSSQL_URL?.trim();
  if (!url) return null;
  const entry = path.join(process.cwd(), "prisma", "generated", "mssql", "index.js");
  if (!existsSync(entry)) return null;
  if (globalForMssql.mssqlPrisma) return globalForMssql.mssqlPrisma;
  try {
    const { PrismaClient } = runtimeRequire(entry);
    const client = new PrismaClient({ datasources: { db: { url } } });
    globalForMssql.mssqlPrisma = client;
    return client;
  } catch (error) {
    console.warn("[MSSQL CLIENT]", error);
    return null;
  }
}
