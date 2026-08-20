import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const cams = await p.campaigns.findMany({
    where: { creatorId: 'cmphnhw8e0002so1uh16dwpvn' },
    orderBy: { createdAt: 'desc' },
  });
  console.log('Total campaigns for test3:', cams.length);
  const [keep, ...dupes] = cams;
  for (const d of dupes) {
    await p.rewards.deleteMany({ where: { campaignId: d.id } });
    await p.campaign_updates.deleteMany({ where: { campaignId: d.id } });
    await p.campaigns.delete({ where: { id: d.id } });
    console.log('Deleted dupe:', d.slug);
  }
  console.log('Kept:', keep.slug, keep.campaignCode);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());
