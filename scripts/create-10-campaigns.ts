import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const testEmail = 'test2@gmail.com';

  console.log('🔍 Checking if test2@gmail.com exists...');

  const user = await prisma.users.findUnique({
    where: { email: testEmail }
  });

  if (!user) {
    console.error('❌ User test2@gmail.com not found. Please create the user first.');
    process.exit(1);
  }

  console.log('✅ Found user:', user.email);
  console.log('🎯 Creating 10 campaigns...');

  const campaigns = [
    {
      campaignCode: 'CAMP-001',
      slug: 'smart-watch-fitness-pro',
      title: 'Smart Watch Fitness Pro - Đồng hồ thông minh theo dõi sức khỏe',
      description: 'Đồng hồ thông minh thế hệ mới với AI theo dõi sức khỏe toàn diện',
      longDescription: '<h2>Giới thiệu</h2><p>Smart Watch Fitness Pro là đồng hồ thông minh cao cấp với tính năng theo dõi sức khỏe bằng AI, pin 14 ngày, chống nước IP68.</p>',
      type: 'REWARD' as const,
      category: 'technology',
      tags: ['smartwatch', 'fitness', 'health'],
      goalAmount: 500000000,
      currentAmount: 350000000,
      status: 'ACTIVE' as const,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-06-30'),
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30']
    },
    {
      campaignCode: 'CAMP-002',
      slug: 'eco-water-bottle-smart',
      title: 'Bình nước thông minh giữ nhiệt 24h',
      description: 'Bình nước thân thiện môi trường với công nghệ giữ nhiệt và nhắc uống nước',
      longDescription: '<h2>Sản phẩm</h2><p>Bình nước thông minh giữ nóng 24h, giữ lạnh 48h, kết nối app nhắc nhở uống nước.</p>',
      type: 'REWARD' as const,
      category: 'lifestyle',
      tags: ['eco-friendly', 'smart', 'bottle'],
      goalAmount: 150000000,
      currentAmount: 180000000,
      status: 'SUCCESS' as const,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8',
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8']
    },
    {
      campaignCode: 'CAMP-003',
      slug: 'wireless-earbuds-anc',
      title: 'Tai nghe không dây chống ồn ANC Pro',
      description: 'Tai nghe true wireless với chống ồn chủ động ANC, âm thanh Hi-Res',
      longDescription: '<h2>Âm thanh</h2><p>Tai nghe ANC Pro với driver 10mm, pin 8h, chống nước IPX5, Bluetooth 5.3.</p>',
      type: 'REWARD' as const,
      category: 'technology',
      tags: ['earbuds', 'audio', 'anc'],
      goalAmount: 300000000,
      currentAmount: 280000000,
      status: 'ACTIVE' as const,
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-05-31'),
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df',
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df']
    },
    {
      campaignCode: 'CAMP-004',
      slug: 'portable-solar-charger',
      title: 'Sạc dự phòng năng lượng mặt trời 20000mAh',
      description: 'Sạc dự phòng sử dụng năng lượng mặt trời, chống nước, chống sốc',
      longDescription: '<h2>Năng lượng xanh</h2><p>Sạc 20000mAh với tấm pin mặt trời, 2 USB-A + 1 USB-C, chống nước IP67.</p>',
      type: 'REWARD' as const,
      category: 'technology',
      tags: ['solar', 'charger', 'eco'],
      goalAmount: 200000000,
      currentAmount: 80000000,
      status: 'FAILED' as const,
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-02-28'),
      imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5',
      images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5']
    },
    {
      campaignCode: 'CAMP-005',
      slug: 'support-children-education',
      title: 'Hỗ trợ học bổng cho trẻ em vùng cao',
      description: 'Chương trình trao 100 suất học bổng và đồ dùng học tập cho trẻ em nghèo',
      longDescription: '<h2>Giáo dục</h2><p>Trao học bổng, xây thư viện mini, tổ chức ngoại khóa cho trẻ em vùng cao.</p>',
      type: 'DONATION' as const,
      category: 'education',
      tags: ['education', 'charity', 'children'],
      goalAmount: 200000000,
      currentAmount: 190000000,
      status: 'ACTIVE' as const,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-05-31'),
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
      images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6']
    },
    {
      campaignCode: 'CAMP-006',
      slug: 'smart-home-hub-pro',
      title: 'Trung tâm điều khiển nhà thông minh Hub Pro',
      description: 'Hub điều khiển tất cả thiết bị IoT, hỗ trợ Zigbee, Z-Wave, WiFi',
      longDescription: '<h2>Nhà thông minh</h2><p>Hub Pro tích hợp Google Assistant, Alexa, điều khiển giọng nói, tự động hóa.</p>',
      type: 'REWARD' as const,
      category: 'technology',
      tags: ['smarthome', 'iot', 'hub'],
      goalAmount: 400000000,
      currentAmount: 120000000,
      status: 'CANCELED' as const,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-04-30'),
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827',
      images: ['https://images.unsplash.com/photo-1558002038-1055907df827']
    },
    {
      campaignCode: 'CAMP-007',
      slug: 'mechanical-keyboard-custom',
      title: 'Bàn phím cơ Custom RGB - Hotswap',
      description: 'Bàn phím cơ 75% layout, hotswap, RGB per-key, case nhôm CNC',
      longDescription: '<h2>Gaming</h2><p>Bàn phím cơ custom với hotswap socket, gasket mount, foam mod, RGB Southpaw.</p>',
      type: 'REWARD' as const,
      category: 'technology',
      tags: ['keyboard', 'gaming', 'custom'],
      goalAmount: 350000000,
      currentAmount: 0,
      status: 'DRAFT' as const,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3']
    },
    {
      campaignCode: 'CAMP-008',
      slug: 'clean-water-project',
      title: 'Dự án nước sạch cho vùng khó khăn',
      description: 'Xây dựng 10 hệ thống lọc nước cộng đồng cho vùng thiếu nước',
      longDescription: '<h2>Nước sạch</h2><p>Lắp đặt hệ thống lọc nước, đào tạo bảo trì, giám sát chất lượng định kỳ.</p>',
      type: 'DONATION' as const,
      category: 'environment',
      tags: ['water', 'environment', 'charity'],
      goalAmount: 500000000,
      currentAmount: 100000000,
      status: 'PENDING_REVIEW' as const,
      startDate: new Date('2026-04-15'),
      endDate: new Date('2026-07-31'),
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
      images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19']
    },
    {
      campaignCode: 'CAMP-009',
      slug: 'mini-projector-4k',
      title: 'Máy chiếu mini 4K Android TV',
      description: 'Máy chiếu di động 4K, Android TV 11, pin 3h, loa stereo',
      longDescription: '<h2>Giải trí</h2><p>Máy chiếu 4K DLP, 500 ANSI lumens, Android TV, Netflix, YouTube, tự động lấy nét.</p>',
      type: 'REWARD' as const,
      category: 'technology',
      tags: ['projector', '4k', 'entertainment'],
      goalAmount: 600000000,
      currentAmount: 450000000,
      status: 'ACTIVE' as const,
      startDate: new Date('2026-03-20'),
      endDate: new Date('2026-06-20'),
      imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26',
      images: ['https://images.unsplash.com/photo-1478720568477-152d9b164e26']
    },
    {
      campaignCode: 'CAMP-010',
      slug: 'electric-scooter-pro',
      title: 'Xe điện gấp gọn Pro - 50km/sạc',
      description: 'Xe điện gấp gọn, tốc độ 25km/h, pin 50km, phanh đĩa kép',
      longDescription: '<h2>Di chuyển</h2><p>Xe điện Pro với motor 350W, pin 48V 10Ah, màn hình LCD, đèn LED, chống nước IP54.</p>',
      type: 'REWARD' as const,
      category: 'transportation',
      tags: ['scooter', 'electric', 'eco'],
      goalAmount: 800000000,
      currentAmount: 650000000,
      status: 'ACTIVE' as const,
      startDate: new Date('2026-04-10'),
      endDate: new Date('2026-07-10'),
      imageUrl: 'https://images.unsplash.com/photo-1559311042-f9b5e6c50b4e',
      images: ['https://images.unsplash.com/photo-1559311042-f9b5e6c50b4e']
    }
  ];

  for (const campaignData of campaigns) {
    console.log(`  Creating: ${campaignData.title}`);
    await prisma.campaigns.create({
      data: {
        ...campaignData,
        creatorId: user.id,
        id: crypto.randomUUID(),
        updatedAt: new Date()
      }
    });
  }

  console.log('\n✅ Created 10 campaigns successfully!');
  console.log('\n📊 Summary:');
  console.log('   - 4 ACTIVE campaigns');
  console.log('   - 1 SUCCESS campaign');
  console.log('   - 1 FAILED campaign');
  console.log('   - 1 CANCELED campaign');
  console.log('   - 1 DRAFT campaign');
  console.log('   - 1 PENDING_REVIEW campaign');
  console.log('   - 1 DONATION campaign (education)');
  console.log('   - 1 DONATION campaign (environment)');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
