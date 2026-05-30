
import { prisma } from '../src/lib/prisma';

async function main() {
  const posts = await prisma.blog_posts.findMany({
    include: {
      users: {
        select: { email: true, name: true }
      }
    }
  });

  console.log(`\n📊 BLOG POSTS IN DATABASE: ${posts.length}`);

  posts.forEach((p, i) => {
    console.log(`\n${i + 1}. Title: ${p.title}`);
    console.log(`   Slug: ${p.slug}`);
    console.log(`   Status: ${p.status}`);
    console.log(`   Author: ${p.users.name} (${p.users.email})`);
    console.log(`   Visibility: ${p.visibility}`);
    console.log(`   PublishedAt: ${p.publishedAt}`);
    console.log(`   DeletedAt: ${p.deletedAt}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
