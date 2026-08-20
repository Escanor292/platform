import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const c = await p.campaigns.findUnique({
    where: { slug: 'mam-xanh-hoc-duong-mt18obvz' },
    select: { id: true, slug: true, campaignCode: true, title: true, projectId: true },
  });
  console.log(JSON.stringify(c));
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());
