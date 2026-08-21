import { PrismaClient } from "../../prisma/generated/client";

export { Prisma } from "../../prisma/generated/client";
export type { users } from "../../prisma/generated/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
