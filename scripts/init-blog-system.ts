// ============================================================
// Initialize Blog System
// Run: npx tsx scripts/init-blog-system.ts
// ============================================================

import 'dotenv/config';
import { initBlogIndexes } from '../src/services/mongodb/blog.service';
import { prisma } from '../src/lib/prisma';

async function initBlogSystem() {
  console.log('🚀 Initializing Blog System...\n');

  try {
    // 1. Create MongoDB indexes
    console.log('📊 Creating MongoDB indexes...');
    await initBlogIndexes();
    console.log('✅ MongoDB indexes created\n');

    // 2. Create default blog categories
    console.log('📁 Creating default blog categories...');
    const categories = [
      { name: 'Tin tức', slug: 'tin-tuc', description: 'Tin tức và thông báo từ nền tảng' },
      { name: 'Hướng dẫn', slug: 'huong-dan', description: 'Hướng dẫn sử dụng và tips' },
      { name: 'Câu chuyện', slug: 'cau-chuyen', description: 'Câu chuyện thành công và tác động' },
      { name: 'Cập nhật dự án', slug: 'cap-nhat-du-an', description: 'Cập nhật từ các chiến dịch' },
    ];

    for (const category of categories) {
      await prisma.blogCategory.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      });
    }
    console.log(`✅ Created ${categories.length} default categories\n`);

    console.log('🎉 Blog System initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing blog system:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initBlogSystem();
