import { prisma } from "@/lib/prisma";
import { getDatabaseTarget } from "@/lib/db/target";
import { getMssqlClient } from "@/lib/db/mssql-client";

export function getDb() {
  if (getDatabaseTarget() !== "sqlserver") return prisma;
  return getMssqlClient() ?? prisma;
}

export { prisma };
