import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('ManusTest@123', 10);
  const updated = await prisma.users.update({
    where: { id: 'cmphnhw8e0002so1uh16dwpvn' },
    data: { password: hash },
    select: { id: true, email: true },
  });
  console.log('UPDATED:', JSON.stringify(updated));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
