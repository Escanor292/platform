require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.users.findMany({
    where: { email: { contains: 'manustest' } },
    select: { id: true, email: true, role: true },
  });
  console.log(JSON.stringify(users));
  await prisma.$disconnect();
}
main().catch(async (e) => {
  console.error(e.message);
  await prisma.$disconnect();
  process.exit(1);
});
