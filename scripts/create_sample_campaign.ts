import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CREATOR_ID = 'cmphnhw8e0002so1uh16dwpvn';

async function main() {
  // Lấy project của test3
  const project = await prisma.projects.findFirst({ where: { creatorId: CREATOR_ID } });
  if (!project) {
    console.error('Không tìm thấy dự án của test3!');
    process.exit(1);
  }
  console.log('Project:', project.id, project.title, project.slug);

  const slug = 'mam-xanh-hoc-duong-' + Date.now().toString(36);
  const code = 'MX-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  const campaign = await prisma.campaigns.create({
    data: {
      id: crypto.randomUUID(),
      campaignCode: code,
      slug,
      title: 'Một cây xanh cho mỗi lớp học',
      description:
        'Chiến dịch trồng 500 cây xanh tại 10 trường tiểu học vùng khó khăn. Mỗi cây xanh sẽ giúp các em có bóng mát và không gian học tập trong lành hơn.',
      longDescription:
        'Trong năm học 2026-2027, chúng tôi hướng tới việc phủ xanh sân trường tại 10 trường tiểu học ở các vùng khó khăn. Với mỗi 100.000 đồng đóng góp, một cây xanh sẽ được trồng và chăm sóc trong 2 năm đầu. Các trường sẽ được chọn theo tiêu chí: thiếu cây xanh, diện tích sân chơi hạn chế, và học sinh thuộc gia đình khó khăn.',
      videoUrl: null,
      imageUrl: null,
      type: 'REWARD',
      category: 'Môi trường',
      tags: ['cây xanh', 'học đường', 'môi trường', 'trẻ em'],
      goalAmount: 50000000, // 50 triệu
      currentAmount: 0,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 ngày
      creatorId: CREATOR_ID,
      projectId: project.id,
      feeRate: 0.08,
      updatedAt: new Date(),
      images: [],
    },
  });
  console.log('Campaign created:', campaign.id, campaign.slug, campaign.campaignCode);

  // Tạo sản phẩm/quà tặng kèm trong chiến dịch
  const reward = await prisma.rewards.create({
    data: {
      id: crypto.randomUUID(),
      campaignId: campaign.id,
      projectId: null,
      title: 'Bảng tri ân xanh',
      description: 'Tên bạn được khắc trên bảng tri ân đặt tại trường được chọn. Đính kèm 1 hạt giống cây xanh gửi tận nhà.',
      minAmount: 100000,
      maxAmount: 120000,
      stock: 200,
      productImages: [],
      isActive: true,
      updatedAt: new Date(),
      deliveryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('Reward created:', reward.id, reward.title);

  // Tạo cập nhật (update) đầu tiên cho chiến dịch
  const update = await prisma.campaign_updates.create({
    data: {
      id: crypto.randomUUID(),
      campaignId: campaign.id,
      title: 'Chính thức khởi động chiến dịch!',
      content:
        'Cảm ơn cộng đồng TửTế Fund đã đồng hành. Chúng tôi vừa hoàn tất thủ tục với các trường đối tác và sẵn sàng triển khai đợt trồng cây đầu tiên vào tháng 9.',
    },
  });
  console.log('Update created:', update.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
