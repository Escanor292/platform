import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Đang gieo mầm dữ liệu mẫu chuyên sâu...");

  const salt = await bcrypt.genSalt(10);
  const adminHashedPassword = await bcrypt.hash("Admin@123456", salt);
  const defaultHashedPassword = await bcrypt.hash("123", salt);

  // 1. Tạo Admin mẫu (theo yêu cầu người dùng)
  const admin = await prisma.user.upsert({
    where: { email: "admin@crowdfunding.vn" },
    update: {
       password: adminHashedPassword,
       isAdmin: true,
       name: "Admin",
       role: "BACKER"
    },
    create: {
      email: "admin@crowdfunding.vn",
      name: "Admin",
      isAdmin: true,
      role: "BACKER", 
      password: adminHashedPassword,
    },
  });

  // 2. Tạo các User mẫu khác (với mật khẩu "123")
  const backer = await prisma.user.upsert({
    where: { email: "test1@gmail.com" },
    update: { password: defaultHashedPassword },
    create: {
      email: "test1@gmail.com",
      name: "Test Backer",
      role: "BACKER",
      password: defaultHashedPassword,
    },
  });

  const creator = await prisma.user.upsert({
    where: { email: "test2@gmail.com" },
    update: { password: defaultHashedPassword },
    create: {
      email: "test2@gmail.com",
      name: "Test Creator",
      role: "CREATOR",
      password: defaultHashedPassword,
    },
  });

  const creatorPro = await prisma.user.upsert({
    where: { email: "test3@gmail.com" },
    update: { password: defaultHashedPassword },
    create: {
      email: "test3@gmail.com",
      name: "Test Creator Pro",
      role: "CREATOR_PRO",
      isPro: true,
      password: defaultHashedPassword,
    },
  });

  // 3. Tạo Campaign mẫu cho Creator
  const campaign = await prisma.campaign.upsert({
    where: { slug: "sach-giao-duc-vung-cao" },
    update: {},
    create: {
      campaignCode: "CF" + Date.now().toString().slice(-6),
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
      rewards: {
        create: [
          { title: "Gói Lời cảm ơn", amount: 50000, description: "Tên bạn sẽ xuất hiện trong danh sách cảm ơn của dự án." },
          { title: "Gói Sách Giấy", amount: 250000, description: "Nhận 1 bộ sách in phiên bản giới hạn." },
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
