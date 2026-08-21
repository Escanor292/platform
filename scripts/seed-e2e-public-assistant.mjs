import prismaPackage from "../prisma/generated/client/index.js";

const { PrismaClient } = prismaPackage;

const prisma = new PrismaClient();
const now = new Date();
const userId = "e2e-public-user";
const projectId = "e2e-public-project";
const campaignId = "e2e-public-campaign";
const rewardId = "e2e-public-product";
const blogId = "e2e-public-blog";

async function seed() {
  await prisma.users.upsert({
    where: { id: userId },
    update: { email: "e2e.public@example.test", name: "Lan Tử Tế", displayName: "Lan Tử Tế", bio: "Người khởi xướng các dự án cộng đồng.", updatedAt: now },
    create: { id: userId, email: "e2e.public@example.test", name: "Lan Tử Tế", displayName: "Lan Tử Tế", bio: "Người khởi xướng các dự án cộng đồng.", updatedAt: now },
  });
  await prisma.projects.upsert({
    where: { slug: "e2e-lop-hoc-xanh" },
    update: { title: "Lớp học xanh", description: "Dự án seed riêng cho kiểm thử E2E.", updatedAt: now },
    create: { id: projectId, creatorId: userId, slug: "e2e-lop-hoc-xanh", title: "Lớp học xanh", description: "Dự án seed riêng cho kiểm thử E2E." },
  });
  await prisma.campaigns.upsert({
    where: { slug: "e2e-song-xanh" },
    update: { title: "Sống xanh", description: "Chiến dịch seed E2E.", status: "ACTIVE", updatedAt: now },
    create: { id: campaignId, campaignCode: "E2E-SONG-XANH", slug: "e2e-song-xanh", title: "Sống xanh", description: "Chiến dịch seed E2E.", category: "Cộng đồng", goalAmount: 1_000_000, currentAmount: 400_000, status: "ACTIVE", creatorId: userId, projectId, updatedAt: now },
  });
  await prisma.rewards.upsert({
    where: { id: rewardId },
    update: { title: "Bình nước tái sử dụng", description: "Sản phẩm hỗ trợ chiến dịch xanh.", minAmount: 150_000, maxAmount: 200_000, stock: 7, isActive: true, projectId, campaignId, updatedAt: now },
    create: { id: rewardId, title: "Bình nước tái sử dụng", description: "Sản phẩm hỗ trợ chiến dịch xanh.", minAmount: 150_000, maxAmount: 200_000, stock: 7, isActive: true, projectId, campaignId, updatedAt: now },
  });
  await prisma.blog_posts.upsert({
    where: { slug: "e2e-nhat-ky-gieo-mam" },
    update: { title: "Nhật ký gieo mầm", excerpt: "Cập nhật hành trình hoạt động cộng đồng.", status: "PUBLISHED", visibility: "PUBLIC", publishedAt: now, viewCount: 42, likeCount: 5, commentCount: 3, updatedAt: now },
    create: { id: blogId, authorId: userId, projectId, title: "Nhật ký gieo mầm", slug: "e2e-nhat-ky-gieo-mam", excerpt: "Cập nhật hành trình hoạt động cộng đồng.", status: "PUBLISHED", visibility: "PUBLIC", publishedAt: now, viewCount: 42, likeCount: 5, commentCount: 3, updatedAt: now },
  });
}

seed()
  .then(() => console.log("E2E public assistant seed complete"))
  .finally(async () => prisma.$disconnect());
