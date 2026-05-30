
import { prisma } from '../src/lib/prisma';

async function main() {
  const campaigns = await prisma.campaigns.findMany({
    select: { id: true, campaignCode: true, title: true, goalAmount: true, currentAmount: true }
  });
  console.log(JSON.stringify(campaigns, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
