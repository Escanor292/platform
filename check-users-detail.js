const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('\n🔍 KIỂM TRA CHI TIẾT TÀI KHOẢN\n');
        
        const totalUsers = await prisma.user.count();
        console.log(`📊 Tổng số tài khoản: ${totalUsers}\n`);

        if (totalUsers > 0) {
            console.log('👥 DANH SÁCH TÀI KHOẢN:\n');
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    isAdmin: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email}`);
                console.log(`   - Tên: ${user.name}`);
                console.log(`   - Role: ${user.role}`);
                console.log(`   - Status: ${user.status}`);
                console.log(`   - Admin: ${user.isAdmin ? 'CÓ' : 'KHÔNG'}`);
                console.log(`   - Ngày tạo: ${user.createdAt.toLocaleString('vi-VN')}`);
                console.log('');
            });

            // Thống kê theo role
            console.log('\n📈 THỐNG KÊ THEO VAI TRÒ:');
            const roleStats = await prisma.user.groupBy({
                by: ['role'],
                _count: true
            });
            roleStats.forEach(stat => {
                console.log(`   - ${stat.role}: ${stat._count} tài khoản`);
            });

            // Thống kê admin
            const adminCount = await prisma.user.count({
                where: { isAdmin: true }
            });
            console.log(`\n👑 Số tài khoản Admin: ${adminCount}`);
        } else {
            console.log('⚠️  Database hiện tại TRỐNG - chưa có tài khoản nào!');
        }

        console.log('\n');
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
