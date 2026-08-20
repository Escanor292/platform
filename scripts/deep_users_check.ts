import { PrismaClient } from "../prisma/generated/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=== ALL USERS (incl. soft-deleted) ===");
  const all = await prisma.users.findMany({
    select: { id: true, email: true, name: true, password: true, createdAt: true },
  });
  console.log("Total:", all.length);
  for (const u of all) {
    let pwCheck = "";
    if (u.password) {
      const isTest123 = await bcrypt.compare("ManusTest@123", u.password);
      pwCheck = `pw=ManusTest@123:${isTest123}`;
    }
    console.log(
      JSON.stringify({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt.toISOString(),
        password: u.password ? "SET" : "NONE",
        pwCheck,
      })
    );
  }

  console.log("\n=== CHAT CONVERSATIONS ===");
  const convs: any[] = await (prisma as any).chats?.findMany?.({ take: 10 }) ?? [];
  console.log(JSON.stringify(convs).slice(0, 500));

  console.log("\n=== MESSAGES TABLES ===");
  const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%message%' OR tablename LIKE '%chat%'`;
  console.log(JSON.stringify(tables));

  await prisma.$disconnect();
}

main().catch(console.error);
