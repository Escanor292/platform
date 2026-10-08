import { existsSync } from "fs";
import path from "path";
import { createRequire } from "module";

type SqlClient = {
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<number>;
  $queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
};

const globalForMssql = global as unknown as { mssqlPrisma?: SqlClient };

export function getMssqlClient(): SqlClient | null {
  if (process.env.NEXT_RUNTIME === "edge") return null;
  const url = process.env.MSSQL_URL?.trim();
  if (!url) return null;
  const entry = path.join(process.cwd(), "prisma", "generated", "mssql", "index.js");
  if (!existsSync(entry)) return null;
  if (globalForMssql.mssqlPrisma) return globalForMssql.mssqlPrisma;
  try {
    const req = createRequire(path.join(process.cwd(), "package.json"));
    const loaded = req(entry) as { PrismaClient: new (args: unknown) => SqlClient };
    const client = new loaded.PrismaClient({ datasources: { db: { url } } });
    globalForMssql.mssqlPrisma = client;
    return client;
  } catch (error) {
    console.warn("[MSSQL CLIENT]", error);
    return null;
  }
}
