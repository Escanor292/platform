import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const id = 'b30ad967-c249-40ff-b6e4-f0b878d56e3b';
  const updated = await prisma.rewards.update({
    where: { id },
    data: {
      minAmount: 55000, // giá bán
      maxAmount: 65000, // giá gốc cao hơn -> % giảm ~15%
    },
  });
  console.log('Updated reward:', updated.id);
  console.log('minAmount:', updated.minAmount, 'maxAmount:', updated.maxAmount);
  const pct = Math.round(((Number(updated.maxAmount) - Number(updated.minAmount)) / Number(updated.maxAmount)) * 100);
  console.log('Discount %:', pct);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
