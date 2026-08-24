const { PrismaClient } = require('../prisma/generated/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();
const TAG = '[FIXTURE-2026]';
const now = new Date();
const day = 24 * 60 * 60 * 1000;
const at = (offset) => new Date(now.getTime() + offset * day);
const id = () => randomUUID();
const slug = (value) => `${value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const image = (idValue, width = 1200, height = 800) => `https://images.unsplash.com/${idValue}?auto=format&fit=crop&w=${width}&q=82`;

const projectSpecs = [
  ['Vườn học xanh cho trẻ em vùng cao', 'Môi trường học tập xanh, an toàn và giàu cảm hứng cho học sinh vùng cao.', '#166534', '#86efac'],
  ['Xưởng truyện tranh Việt', 'Phát triển IP truyện tranh Việt Nam với đội ngũ họa sĩ trẻ.', '#7c2d12', '#fdba74'],
  ['Lớp học kỹ năng số cộng đồng', 'Đưa kỹ năng số và công cụ AI thiết thực đến các thư viện địa phương.', '#1e3a8a', '#93c5fd'],
  ['Bếp ăn tử tế mỗi ngày', 'Kết nối nguồn lực để duy trì những bữa ăn dinh dưỡng cho người lao động khó khăn.', '#9a3412', '#fed7aa'],
  ['Âm nhạc chữa lành', 'Một không gian âm nhạc độc lập cho nghệ sĩ và cộng đồng.', '#581c87', '#d8b4fe'],
  ['Nông trại tuần hoàn', 'Thử nghiệm mô hình nông nghiệp nhỏ, tiết kiệm nước và không rác thải.', '#115e59', '#99f6e4'],
];

const campaignSpecs = [
  ['Trồng 1.000 cây quanh trường học', 'ACTIVE', 80000000, 52000000, -12, 25],
  ['Bộ lọc nước cho bản làng', 'PENDING_REVIEW', 120000000, 0, 3, 45],
  ['Tập 1: Người giữ lửa', 'ACTIVE', 150000000, 103000000, -4, 18],
  ['In thử nghiệm 500 bản truyện', 'DRAFT', 70000000, 0, 10, 60],
  ['Phòng máy tính lưu động', 'SUCCESS', 200000000, 238000000, -120, -60],
  ['Ngày hội kỹ năng số', 'FAILED', 60000000, 17000000, -120, -40],
  ['Suất ăn sáng tháng 9', 'ACTIVE', 90000000, 67000000, -20, 10],
  ['Tủ lạnh cộng đồng', 'CANCELED', 110000000, 24000000, -90, -20],
  ['Album Mầm sáng', 'ACTIVE', 180000000, 41000000, -7, 50],
  ['Workshop phòng thu miễn phí', 'PENDING_REVIEW', 50000000, 0, 7, 35],
  ['Vườn rau không rác thải', 'SUCCESS', 95000000, 112000000, -180, -100],
  ['Hệ thống tưới nhỏ giọt', 'DRAFT', 130000000, 0, 20, 80],
];

const productSpecs = [
  ['Áo thun Vườn học xanh', 189000, 249000, 46, true, 30, 50, 'AVAILABLE', 'PHYSICAL'],
  ['Bình nước inox gây quỹ', 159000, null, 0, false, 30, 50, 'AVAILABLE', 'PHYSICAL'],
  ['Poster Người giữ lửa A3', 89000, 119000, 18, false, 30, 50, 'AVAILABLE', 'PHYSICAL'],
  ['Artbook Người giữ lửa - bản giới hạn', 349000, 399000, 12, true, 25, 45, 'AVAILABLE', 'PHYSICAL'],
  ['Vé workshop kỹ năng số', 120000, null, 80, false, 30, 50, 'AVAILABLE', 'EMAIL'],
  ['Khóa học AI cho người mới', 599000, 799000, 0, true, 35, 55, 'DEVELOPMENT', 'DOWNLOAD'],
  ['Combo 10 suất ăn sáng', 250000, null, 35, false, 30, 50, 'AVAILABLE', 'PHYSICAL'],
  ['Sổ tay Bếp tử tế', 79000, 99000, 100, false, 30, 50, 'AVAILABLE', 'PHYSICAL'],
  ['Album Mầm sáng - digital', 129000, 159000, null, false, 30, 50, 'AVAILABLE', 'DOWNLOAD'],
  ['Vé đêm nhạc Mầm sáng', 350000, null, 0, true, 20, 40, 'AVAILABLE', 'EMAIL'],
  ['Bộ hạt giống vườn ban công', 139000, 179000, 27, false, 30, 50, 'AVAILABLE', 'PHYSICAL'],
  ['Tư vấn thiết kế vườn 1:1', 990000, null, 5, false, 30, 50, 'DEVELOPMENT', 'EMAIL'],
  ['Bộ sticker Xưởng truyện tranh', 49000, null, 250, false, 30, 50, 'AVAILABLE', 'PHYSICAL'],
  ['License font chữ Việt', 299000, 399000, null, false, 40, 60, 'AVAILABLE', 'LICENSE_KEY'],
  ['Truyện tranh PDF tập 1', 69000, null, null, false, 30, 50, 'AVAILABLE', 'DIGITAL_COMIC'],
  ['Hộp quà cuối mùa', 449000, 549000, 8, true, 30, 50, 'AVAILABLE', 'PHYSICAL'],
];

function content(title, index) {
  return `# ${title}\n\nĐây là nội dung fixture để kiểm thử hiển thị bài viết, trạng thái, liên kết sản phẩm và điều hướng trong nền tảng. Bài viết số ${index} có đủ đoạn văn dài để kiểm tra typography, ảnh bìa, sản phẩm nhúng và chế độ hiển thị.\n\n## Câu chuyện phía sau\n\nĐội ngũ cập nhật tiến độ minh bạch, chia sẻ kết quả và ghi nhận đóng góp của cộng đồng. Nội dung này chỉ phục vụ môi trường kiểm thử.`;
}

async function findCreators() {
  const preferred = await prisma.users.findUnique({ where: { id: 'cmphnhw8e0002so1uh16dwpvn' } });
  const creators = await prisma.users.findMany({ where: { role: 'CREATOR' }, orderBy: { createdAt: 'asc' }, take: 6 });
  const result = [];
  if (preferred) result.push(preferred);
  for (const creator of creators) if (!result.some((item) => item.id === creator.id)) result.push(creator);
  if (!result.length) throw new Error('Không tìm thấy tài khoản CREATOR để gắn dữ liệu fixture.');
  return result;
}

async function clearPrevious() {
  const blogs = await prisma.blog_posts.findMany({ where: { title: { startsWith: TAG } }, select: { id: true } });
  const rewards = await prisma.rewards.findMany({ where: { title: { startsWith: TAG } }, select: { id: true } });
  const campaigns = await prisma.campaigns.findMany({ where: { title: { startsWith: TAG } }, select: { id: true } });
  const projects = await prisma.projects.findMany({ where: { title: { startsWith: TAG } }, select: { id: true } });
  if (blogs.length) await prisma.blog_posts.deleteMany({ where: { id: { in: blogs.map((x) => x.id) } } });
  if (rewards.length) await prisma.rewards.deleteMany({ where: { id: { in: rewards.map((x) => x.id) } } });
  if (campaigns.length) await prisma.campaigns.deleteMany({ where: { id: { in: campaigns.map((x) => x.id) } } });
  if (projects.length) await prisma.projects.deleteMany({ where: { id: { in: projects.map((x) => x.id) } } });
}

async function main() {
  const creators = await findCreators();
  await clearPrevious();
  const projects = [];
  for (let i = 0; i < projectSpecs.length; i += 1) {
    const [title, description, colorA, colorB] = projectSpecs[i];
    const creator = creators[i % creators.length];
    projects.push(await prisma.projects.create({ data: {
      creatorId: creator.id, title: `${TAG} ${title}`, slug: slug(title), description,
      coverImage: image(['photo-1497366811353-6870744d04b2', 'photo-1513542789411-b6a5d4f31634', 'photo-1497366754035-f200968a6e72', 'photo-1542810634-71277d95dcbb', 'photo-1516280440614-37939bbacd81', 'photo-1501004318641-b39e6451bec6'][i]),
      richDescription: { sections: ['Tầm nhìn', 'Tác động', 'Lộ trình'], fixture: true }, heroBackgroundType: i % 2 ? 'color' : 'image', heroBackgroundConfig: { colors: [colorA, colorB], angle: 135 },
    }}));
  }

  const campaigns = [];
  for (let i = 0; i < campaignSpecs.length; i += 1) {
    const [title, status, goal, current, startOffset, endOffset] = campaignSpecs[i];
    const project = projects[i % projects.length];
    const creator = creators[i % creators.length];
    campaigns.push(await prisma.campaigns.create({ data: {
      id: id(), campaignCode: `FIX-${Date.now()}-${i}`, slug: slug(title), title: `${TAG} ${title}`, description: `Chiến dịch kiểm thử: ${title}.`, longDescription: content(title, i + 1),
      imageUrl: image(['photo-1497250681960-ef046c08a56e', 'photo-1451187580459-43490279c0fa', 'photo-1531058020387-3be344556be6', 'photo-1542838132-92c53300491e'][i % 4]), images: [], type: i % 4 === 7 ? 'DONATION' : 'REWARD', category: ['Môi trường', 'Công nghệ', 'Giáo dục', 'Cộng đồng'][i % 4], tags: ['fixture', status.toLowerCase(), i % 2 ? 'preorder' : 'community'], goalAmount: goal, currentAmount: current, closedAmount: ['SUCCESS', 'FAILED', 'CANCELED'].includes(status) ? current : null, status, creatorId: creator.id, projectId: project.id, startDate: at(startOffset), endDate: at(endOffset), feeRate: 0.08, updatedAt: now,
    }}));
  }

  const rewards = [];
  for (let i = 0; i < productSpecs.length; i += 1) {
    const [title, price, maxPrice, stock, preorder, onlineDeposit, codDeposit, availability, fulfillmentType] = productSpecs[i];
    const campaign = campaigns[i % campaigns.length];
    const project = projects[i % projects.length];
    const creator = creators[i % creators.length];
    rewards.push(await prisma.rewards.create({ data: {
      id: id(), campaignId: campaign.id, projectId: project.id, title: `${TAG} ${title}`, description: `Sản phẩm fixture ${title}, dùng để kiểm thử giỏ hàng, checkout, COD và giao hàng.`, minAmount: price, maxAmount: maxPrice, stock, maxQuantity: stock === null ? null : stock + 20,
      productImages: [image(['photo-1523275335684-37898b6baf30', 'photo-1542291026-7eec264c27ff', 'photo-1512820790803-83ca734da794', 'photo-1495474472287-4d71bcdd2085', 'photo-1516321318423-f06f85e504b3'][i % 5], 900, 900)], productVideo: i % 5 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
      isPreorder: preorder, deliveryDate: preorder ? at(25 + i * 4) : null, onlineDepositPercent: onlineDeposit, codDepositPercent: codDeposit, isActive: i !== 15, isIncludedInProject: i % 4 !== 3, availability, fulfillmentType, updatedAt: now,
    }}));
  }

  const testUsers = await prisma.users.findMany({ orderBy: { createdAt: 'asc' }, take: 8 });
  if (!testUsers.length) throw new Error('Không tìm thấy người dùng để tạo pledge/review fixture.');
  for (let i = 0; i < rewards.length; i += 1) {
    const reward = rewards[i];
    const buyer = testUsers[i % testUsers.length];
    const amount = Number(reward.minAmount);
    const pledge = await prisma.pledges.create({ data: {
      id: id(), campaignId: reward.campaignId, rewardId: reward.id, userId: buyer.id, displayName: buyer.name, isAnonymous: false, quantity: 1,
      isCashOnDelivery: i % 3 === 0, stockReserved: false, email: buyer.email, amount, depositAmount: i % 3 === 0 ? amount * 0.5 : amount, chargeAmount: amount, orderTotalAmount: amount, remainingAmount: 0, paidAmount: amount, accountingAmount: amount, totalAmount: amount,
      paymentProvider: i % 3 === 0 ? 'COD' : 'TEST', transactionId: `FIXTURE-SALE-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`, status: 'SUCCESS', fulfillmentType: reward.fulfillmentType, fulfillmentStatus: reward.fulfillmentType === 'PHYSICAL' ? 'DELIVERED' : 'DELIVERED', receivedAt: at(-i - 2), updatedAt: now,
    }});
    if (i < 8 && i % 2 === 0) {
      await prisma.product_reviews.create({ data: { id: id(), rewardId: reward.id, pledgeId: pledge.id, userId: buyer.id, rating: 3 + (i % 3), comment: `Đánh giá fixture ${i + 1}: sản phẩm đúng mô tả và dễ sử dụng.`, mediaUrls: [], updatedAt: now } });
    }
  }

  const blogs = [];
  const blogSpecs = [
    ['Nhật ký gieo mầm tuần đầu', 'PUBLISHED', 'STORY', 'PUBLIC'], ['Bản tin tiến độ tháng này', 'DRAFT', 'CAMPAIGN_UPDATE', 'OWNER_ONLY'], ['Tác động sau 100 ngày', 'PUBLISHED', 'IMPACT_REPORT', 'PUBLIC'], ['Thông báo mở đăng ký workshop', 'PENDING_REVIEW', 'ANNOUNCEMENT', 'PUBLIC'], ['Câu chuyện của một họa sĩ trẻ', 'ARCHIVED', 'STORY', 'PUBLIC'], ['Bài viết độc lập về sống xanh', 'PUBLISHED', 'PLATFORM', 'PUBLIC'], ['Bản nháp kế hoạch mùa thu', 'DRAFT', 'PLATFORM', 'PRIVATE'], ['Lời cảm ơn cộng đồng', 'PUBLISHED', 'ANNOUNCEMENT', 'BACKERS_ONLY'], ['Hướng dẫn nhận sản phẩm số', 'PUBLISHED', 'PLATFORM', 'PUBLIC'], ['Báo cáo minh bạch gây quỹ', 'REJECTED', 'IMPACT_REPORT', 'OWNER_ONLY'],
  ];
  for (let i = 0; i < blogSpecs.length; i += 1) {
    const [title, status, type, visibility] = blogSpecs[i];
    const campaign = campaigns[i % campaigns.length];
    const project = projects[i % projects.length];
    const creator = creators[i % creators.length];
    const independent = i === 5 || i === 6;
    const blog = await prisma.blog_posts.create({ data: {
      id: id(), authorId: creator.id, campaignId: independent ? null : campaign.id, projectId: independent ? null : project.id, title: `${TAG} ${title}`, slug: slug(title), excerpt: `Tóm tắt fixture: ${title}.`, coverImage: image(['photo-1499750310107-5fef28a66643', 'photo-1455390582262-044cdead277a', 'photo-1500530855697-b586d89ba3ee'][i % 3]), status, type, visibility, publishedAt: status === 'PUBLISHED' ? at(-i - 1) : null, content: content(title, i + 1), viewCount: i * 17, likeCount: i * 3, commentCount: i % 4, bookmarkCount: i % 3, isFeatured: i % 4 === 0, wordCount: 220 + i * 30, readingTimeMinutes: 2 + (i % 6), updatedAt: now,
    }});
    blogs.push(blog);
    if (!independent) {
      await prisma.campaign_blog_links.create({ data: { id: id(), campaignId: campaign.id, blogPostId: blog.id, order: i } });
      await prisma.project_blog_links.create({ data: { projectId: project.id, blogPostId: blog.id, order: i } });
    }
  }

  for (let i = 0; i < rewards.length; i += 1) {
    if (i % 2 === 0) await prisma.project_reward_links.create({ data: { projectId: projects[i % projects.length].id, rewardId: rewards[i].id, order: i } });
    if (i % 3 === 0) await prisma.blog_posts.update({ where: { id: blogs[(i + 2) % blogs.length].id }, data: { rewards: { connect: { id: rewards[i].id } } } });
  }

  console.log(JSON.stringify({ fixtureTag: TAG, creators: creators.length, projects: projects.length, campaigns: campaigns.length, blogs: blogs.length, products: rewards.length, statuses: { campaigns: [...new Set(campaignSpecs.map((x) => x[1]))], blogs: [...new Set(blogSpecs.map((x) => x[1]))], products: [...new Set(productSpecs.map((x) => `${x[7]}${x[4] ? '-PREORDER' : ''}`))] } }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
