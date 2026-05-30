import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "test2@gmail.com";

  // Tìm user
  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ Không tìm thấy user với email: ${email}`);
    return;
  }

  console.log(`✅ Tìm thấy user: ${user.name} (${user.email})`);

  // Các mạng xã hội mẫu
  const socialLinks = [
    {
      platform: "facebook",
      url: "https://facebook.com/johndoe",
      displayText: "John Doe",
    },
    {
      platform: "x",
      url: "https://twitter.com/johndoe",
      displayText: "@johndoe",
    },
    {
      platform: "instagram",
      url: "https://instagram.com/johndoe",
      displayText: "@johndoe",
    },
    {
      platform: "linkedin",
      url: "https://linkedin.com/in/johndoe",
      displayText: "John Doe",
    },
    {
      platform: "github",
      url: "https://github.com/johndoe",
      displayText: "johndoe",
    },
    {
      platform: "youtube",
      url: "https://youtube.com/@johndoe",
      displayText: "@johndoe",
    },
    {
      platform: "tiktok",
      url: "https://tiktok.com/@johndoe",
      displayText: "@johndoe",
    },
    {
      platform: "website",
      url: "https://johndoe.com",
      displayText: "johndoe.com",
    },
  ];

  // Cập nhật user với social links
  const updated = await prisma.users.update({
    where: { id: user.id },
    data: {
      socialLinks: socialLinks,
    },
  });

  console.log(`\n✅ Đã thêm ${socialLinks.length} mạng xã hội cho user ${user.name}:`);
  socialLinks.forEach((link) => {
    console.log(`   - ${link.platform}: ${link.url}`);
  });

  console.log("\n📊 Thông tin user sau khi cập nhật:");
  console.log(JSON.stringify(updated.socialLinks, null, 2));
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
