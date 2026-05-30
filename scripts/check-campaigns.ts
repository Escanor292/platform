import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.users.findUnique({
    where: { email: 'test2@gmail.com' },
    include: {
      campaigns: true
    }
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('✅ User:', user.email);
  console.log('📊 Total campaigns:', user.campaigns.length);
  console.log('\nCampaigns:');
  user.campaigns.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title} - ${c.status}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
