import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const rows = await prisma.$queryRaw`
  SELECT column_name, is_nullable
  FROM information_schema.columns
  WHERE table_name='rewards' AND column_name IN ('campaignId','projectId')
  ORDER BY column_name;
`;
console.log(JSON.stringify(rows, null, 2));
// Test insert reward without campaignId
try {
  const r = await prisma.rewards.create({
    data: {
      id: crypto.randomUUID(),
      projectId: "test",
      title: "Test insert only",
      minAmount: 10,
      isActive: false,
    },
  });
  console.log("INSERT OK:", r.id);
  await prisma.rewards.delete({ where: { id: r.id } });
} catch (e) {
  console.log("INSERT ERROR:", e.message.slice(0, 200));
}
await prisma.$disconnect();
process.exit(0);
