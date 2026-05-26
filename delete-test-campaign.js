const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.campaign.deleteMany({});
    console.log('✅ Đã xóa tất cả campaigns');
}

main()
    .catch(e => console.error('❌ Lỗi:', e))
    .finally(() => prisma.$disconnect());
