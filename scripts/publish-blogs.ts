
import { prisma } from '../src/lib/prisma';

async function main() {
  const result = await prisma.blogPost.updateMany({
    where: {
      status: 'PENDING_REVIEW'
    },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
  });

  console.log(`✅ Successfully published ${result.count} posts.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
