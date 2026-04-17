import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'test2@gmail.com' },
    select: { id: true, email: true, name: true }
  });

  console.log('User info:', user);
  
  if (user) {
    const campaigns = await prisma.campaign.findMany({
      where: { creatorId: user.id },
      select: { id: true, title: true, campaignCode: true }
    });
    
    console.log('\nCampaigns count:', campaigns.length);
    console.log('First 3 campaigns:', campaigns.slice(0, 3));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
