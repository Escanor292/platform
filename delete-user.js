const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const userId = 'cmp3xymzq0000147kc1aaoxzy';
    
    try {
        console.log(`\n🔍 Đang tìm tài khoản với ID: ${userId}\n`);
        
        // Kiểm tra tài khoản có tồn tại không
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isAdmin: true
            }
        });

        if (!user) {
            console.log('❌ Không tìm thấy tài khoản với ID này!');
            return;
        }

        console.log('📋 Thông tin tài khoản:');
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Tên: ${user.name}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Admin: ${user.isAdmin ? 'CÓ' : 'KHÔNG'}`);
        console.log('');

        // Xóa tài khoản
        console.log('🗑️  Đang xóa tài khoản...');
        await prisma.user.delete({
            where: { id: userId }
        });

        console.log('✅ Đã xóa tài khoản thành công!\n');

        // Kiểm tra lại số lượng tài khoản còn lại
        const remainingUsers = await prisma.user.count();
        console.log(`📊 Số tài khoản còn lại: ${remainingUsers}\n`);

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
