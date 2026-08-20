import prisma from '../src/lib/prisma';

async function main() {
  const rewards = await prisma.rewards.findMany({
    select: { id: true, title: true, campaignId: true, projectId: true },
  });
  console.log('REWARDS:', JSON.stringify(rewards, null, 2));
  const projects = await prisma.projects.findMany({ select: { id: true, title: true } });
  console.log('PROJECTS:', JSON.stringify(projects, null, 2));
  const campaigns = await prisma.campaigns.findMany({ select: { id: true, title: true, slug: true } });
  console.log('CAMPAIGNS:', JSON.stringify(campaigns, null, 2));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
