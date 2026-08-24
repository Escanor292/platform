const { PrismaClient } = require('../prisma/generated/client');
const prisma = new PrismaClient();
const TAG = '[FIXTURE-2026]';
async function main() {
  const [projects, campaigns, blogs, products, linkedBlogs, linkedProducts] = await Promise.all([
    prisma.projects.count({ where: { title: { startsWith: TAG } } }),
    prisma.campaigns.findMany({ where: { title: { startsWith: TAG } }, select: { status: true, projectId: true, currentAmount: true, goalAmount: true } }),
    prisma.blog_posts.findMany({ where: { title: { startsWith: TAG } }, select: { status: true, projectId: true, campaignId: true } }),
    prisma.rewards.findMany({ where: { title: { startsWith: TAG } }, select: { stock: true, isPreorder: true, deliveryDate: true, onlineDepositPercent: true, codDepositPercent: true, availability: true, fulfillmentType: true, campaignId: true, projectId: true } }),
    prisma.project_blog_links.count({ where: { blog_posts: { title: { startsWith: TAG } } } }),
    prisma.project_reward_links.count({ where: { rewards: { title: { startsWith: TAG } } } }),
  ]);
  const countBy = (items, key) => items.reduce((acc, item) => { acc[item[key]] = (acc[item[key]] || 0) + 1; return acc; }, {});
  const preorderWithoutDate = products.filter((x) => x.isPreorder && !x.deliveryDate).length;
  const invalidCampaign = campaigns.filter((x) => !x.projectId).length;
  const invalidProduct = products.filter((x) => !x.campaignId || !x.projectId).length;
  const invalidBlog = blogs.filter((x) => !x.projectId && !x.campaignId).length;
  console.log(JSON.stringify({ projects, campaigns: campaigns.length, blogs: blogs.length, products: products.length, campaignStatuses: countBy(campaigns, 'status'), blogStatuses: countBy(blogs, 'status'), productAvailability: countBy(products, 'availability'), fulfillmentTypes: countBy(products, 'fulfillmentType'), preorderCount: products.filter((x) => x.isPreorder).length, zeroStockCount: products.filter((x) => x.stock === 0).length, linkedBlogs, linkedProducts, invalidCampaign, invalidProduct, independentBlogs: invalidBlog }, null, 2));
  if (invalidCampaign || invalidProduct || preorderWithoutDate) throw new Error(`Fixture validation failed: invalidCampaign=${invalidCampaign}, invalidProduct=${invalidProduct}, preorderWithoutDate=${preorderWithoutDate}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
