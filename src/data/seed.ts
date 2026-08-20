import { PrismaClient } from "../../prisma/generated/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Đang gieo mầm dữ liệu mẫu chuyên sâu...");

  const salt = await bcrypt.genSalt(10);
  const adminHashedPassword = await bcrypt.hash("Admin@123456", salt);
  const defaultHashedPassword = await bcrypt.hash("123", salt);

  // 1. Tạo Admin mẫu (theo yêu cầu người dùng)
  const admin = await prisma.users.upsert({
    where: { email: "admin@crowdfunding.vn" },
    update: {
      password: adminHashedPassword,
      isAdmin: true,
      name: "Admin",
      role: "ADMIN"
    },
    create: {
      id: crypto.randomUUID(),
      email: "admin@crowdfunding.vn",
      name: "Admin",
      isAdmin: true,
      role: "ADMIN",
      password: adminHashedPassword,
      updatedAt: new Date(),
    },
  });

  // 2. Tạo các User mẫu khác (với mật khẩu "123")
  const backer = await prisma.users.upsert({
    where: { email: "test1@gmail.com" },
    update: { password: defaultHashedPassword },
    create: {
      id: crypto.randomUUID(),
      email: "test1@gmail.com",
      name: "Test Backer",
      role: "BACKER",
      password: defaultHashedPassword,
      updatedAt: new Date(),
    },
  });

  const creator = await prisma.users.upsert({
    where: { email: "test2@gmail.com" },
    update: { password: defaultHashedPassword },
    create: {
      id: crypto.randomUUID(),
      email: "test2@gmail.com",
      name: "Test Creator",
      role: "CREATOR",
      password: defaultHashedPassword,
      updatedAt: new Date(),
    },
  });

  const creatorPro = await prisma.users.upsert({
    where: { email: "test3@gmail.com" },
    update: { password: defaultHashedPassword },
    create: {
      id: crypto.randomUUID(),
      email: "test3@gmail.com",
      name: "Test Creator Pro",
      role: "CREATOR",
      status: "PRO",
      password: defaultHashedPassword,
      updatedAt: new Date(),
    },
  });

  // 3. Tạo Campaign mẫu cho Creator
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const campaign = await prisma.campaigns.upsert({
    where: { slug: "sach-giao-duc-vung-cao" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      campaignCode: `CF-${dateStr}-SEED1`,
      slug: "sach-giao-duc-vung-cao",
      title: "Phát triển bộ sách giáo dục di động cho trẻ em vùng cao",
      description: "Giúp hàng nghìn trẻ em tiếp cận kiến thức qua thiết bị di động.",
      longDescription: "Chúng tôi đang xây dựng một bộ sách điện tử có khả năng chạy offline trên mọi thiết bị di động cũ...",
      goalAmount: 150000000,
      currentAmount: 45200000,
      status: "ACTIVE",
      creatorId: creator.id,
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80",
      category: "Giáo dục",
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      rewards: {
        create: [
          { id: crypto.randomUUID(), title: "Gói Lời cảm ơn", minAmount: 50000, description: "Tên bạn sẽ xuất hiện trong danh sách cảm ơn của dự án.", updatedAt: new Date() },
          { id: crypto.randomUUID(), title: "Gói Sách Giấy", minAmount: 250000, description: "Nhận 1 bộ sách in phiên bản giới hạn.", updatedAt: new Date() },
        ]
      }
    }
  });

  console.log(`✅ Đã gieo mầm admin: ${admin.email}`);
  console.log(`✅ Đã gieo mầm backer: ${backer.email}`);
  console.log(`✅ Đã gieo mầm creator: ${creator.email}`);
  console.log(`✅ Đã gieo mầm creator pro: ${creatorPro.email}`);
  console.log(`✅ Đã tạo/cập nhật campaign: ${campaign.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
