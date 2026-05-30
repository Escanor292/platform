import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBadges() {
  console.log('🎖️  Seeding badges...');

  // Find admin user
  const admin = await prisma.users.findFirst({
    where: { isAdmin: true },
  });

  if (!admin) {
    console.error('❌ No admin user found. Please create an admin user first.');
    return;
  }

  console.log(`✅ Found admin: ${admin.name} (${admin.email})`);

  // Sample badges
  const badges = [
    // Achievement Badges
    {
      name: 'Top Donor',
      slug: 'top-donor',
      description: 'Người ủng hộ xuất sắc nhất với tổng đóng góp cao nhất',
      type: 'achievement' as const,
      rarity: 'legendary' as const,
      iconName: '🏆',
      color: '#f59e0b',
      backgroundColor: '#fef3c7',
      isActive: true,
      createdBy: admin.id,
    },
    {
      name: 'Early Supporter',
      slug: 'early-supporter',
      description: 'Người ủng hộ sớm trong 24h đầu tiên của chiến dịch',
      type: 'achievement' as const,
      rarity: 'rare' as const,
      iconName: '⭐',
      color: '#3b82f6',
      backgroundColor: '#dbeafe',
      isActive: true,
      createdBy: admin.id,
    },
    {
      name: '10 Campaigns Supported',
      slug: '10-campaigns-supported',
      description: 'Đã ủng hộ 10 chiến dịch khác nhau',
      type: 'achievement' as const,
      rarity: 'epic' as const,
      iconName: '🎯',
      color: '#a855f7',
      backgroundColor: '#f3e8ff',
      isActive: true,
      createdBy: admin.id,
    },
    {
      name: 'Successful Fundraiser',
      slug: 'successful-fundraiser',
      description: 'Đã tạo chiến dịch thành công đạt 100% mục tiêu',
      type: 'achievement' as const,
      rarity: 'epic' as const,
      iconName: '🎉',
      color: '#10b981',
      backgroundColor: '#d1fae5',
      isActive: true,
      createdBy: admin.id,
    },
    {
      name: '100 Donations',
      slug: '100-donations',
      description: 'Đã thực hiện 100 lượt đóng góp',
      type: 'achievement' as const,
      rarity: 'legendary' as const,
      iconName: '💎',
      color: '#8b5cf6',
      backgroundColor: '#ede9fe',
      isActive: true,
      createdBy: admin.id,
    },

    // Custom Badges
    {
      name: 'Người truyền cảm hứng',
      slug: 'nguoi-truyen-cam-hung',
      description: 'Thành viên có câu chuyện truyền cảm hứng cho cộng đồng',
      type: 'custom' as const,
      rarity: 'rare' as const,
      iconName: '✨',
      color: '#ec4899',
      backgroundColor: '#fce7f3',
      isActive: true,
      createdBy: admin.id,
    },
    {
      name: 'Thành viên nổi bật',
      slug: 'thanh-vien-noi-bat',
      description: 'Thành viên có đóng góp nổi bật cho cộng đồng',
      type: 'custom' as const,
      rarity: 'epic' as const,
      iconName: '🌟',
      color: '#f59e0b',
      backgroundColor: '#fef3c7',
      isActive: true,
      createdBy: admin.id,
    },
    {
      name: 'Nhà tài trợ đặc biệt',
      slug: 'nha-tai-tro-dac-biet',
      description: 'Nhà tài trợ có đóng góp đặc biệt cho nền tảng',
      type: 'custom' as const,
      rarity: 'legendary' as const,
      iconName: '👑',
      color: '#dc2626',
      backgroundColor: '#fee2e2',
      isActive: true,
      createdBy: admin.id,
    },
    {
      name: 'Đối tác cộng đồng',
      slug: 'doi-tac-cong-dong',
      description: 'Đối tác chiến lược của nền tảng',
      type: 'custom' as const,
      rarity: 'epic' as const,
      iconName: '🤝',
      color: '#0891b2',
      backgroundColor: '#cffafe',
      isActive: true,
      createdBy: admin.id,
    },
    {
      name: 'Verified Creator',
      slug: 'verified-creator',
      description: 'Người tạo chiến dịch đã được xác minh',
      type: 'custom' as const,
      rarity: 'common' as const,
      iconName: '✓',
      color: '#059669',
      backgroundColor: '#d1fae5',
      isActive: true,
      createdBy: admin.id,
    },
  ];

  // Create badges
  for (const badge of badges) {
    try {
      const created = await prisma.badges.create({
        data: {
          ...badge,
          id: crypto.randomUUID(),
          updated_at: new Date(),
          users: {
            connect: {
              id: badge.createdBy,
            },
          },
        },
      });
      console.log(`✅ Created badge: ${created.name} (${created.type})`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Badge already exists: ${badge.name}`);
      } else {
        console.error(`❌ Error creating badge ${badge.name}:`, error.message);
      }
    }
  }

  console.log('\n🎉 Badge seeding completed!');
  console.log(`\n📊 Summary:`);

  const totalBadges = await prisma.badges.count();
  const achievementBadges = await prisma.badges.count({
    where: { type: 'achievement' },
  });
  const customBadges = await prisma.badges.count({
    where: { type: 'custom' },
  });

  console.log(`   Total badges: ${totalBadges}`);
  console.log(`   Achievement badges: ${achievementBadges}`);
  console.log(`   Custom badges: ${customBadges}`);
}

seedBadges()
  .catch((error) => {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
