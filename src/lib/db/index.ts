import { prisma } from "@/lib/prisma";
import { getDatabaseTarget } from "@/lib/db/target";

export function getDb() {
  if (getDatabaseTarget() === "postgresql") return prisma;
  throw new Error("SQL Server chưa sẵn sàng. Web vẫn dùng Neon.");
}

export { prisma };
