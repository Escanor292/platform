require("dotenv").config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.users.findUnique({
    where: { id: 'cmphnhw8e0002so1uh16dwpvn' },
    select: { id: true, name: true, email: true, password: true, role: true },
  });
  if (!user) {
    console.log('USER_NOT_FOUND');
    return;
  }
  console.log(JSON.stringify({ ...user, password: user.password ? user.password.slice(0, 7) + '...' : null }));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
