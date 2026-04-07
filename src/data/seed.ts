import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Đang gieo mầm dữ liệu mẫu...");

  // 1. Tạo Admin & Creator mẫu
  const admin = await prisma.user.upsert({
    where: { email: "admin@cfvn.com" },
    update: {},
    create: {
      email: "admin@cfvn.com",
      name: "CFVN Administrator",
      username: "admin_cfvn",
      role: "ADMIN",
    },
  });

  const creator = await prisma.user.upsert({
    where: { email: "sachviet@gmail.com" },
    update: {},
    create: {
      email: "sachviet@gmail.com",
      name: "Dự án Sách Việt",
      username: "sachviet",
      role: "CREATOR",
    },
  });

  // 2. Tạo Campaign mẫu
  const campaign = await prisma.campaign.create({
    data: {
      title: "Phát triển bộ sách giáo dục di động cho trẻ em vùng cao",
      tagline: "Giúp hàng nghìn trẻ em tiếp cận kiến thức qua thiết bị di động.",
      description: "Chúng tôi đang xây dựng một bộ sách điện tử có khả năng chạy offline trên mọi thiết bị di động cũ...",
      goalAmount: 150000000,
      currentAmount: 45200000,
      status: "ACTIVE",
      slug: "sach-giao-duc-vung-cao",
      creatorId: creator.id,
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80",
      category: "Giáo dục",
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Còn 30 ngày
      rewards: {
        create: [
          { title: "Gói Lời cảm ơn", amount: 50000, description: "Tên bạn sẽ xuất hiện trong danh sách cảm ơn của dự án." },
          { title: "Gói Sách Giấy", amount: 250000, description: "Nhận 1 bộ sách in phiên bản giới hạn." },
          { title: "Gói Đại sứ", amount: 1000000, description: "Trở thành người đồng hành chiến lược với dự án." },
        ]
      }
    }
  });

  console.log(`✅ Đã tạo admin: ${admin.email}`);
  console.log(`✅ Đã tạo campaign: ${campaign.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
