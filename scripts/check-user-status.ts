import prisma from '../src/lib/prisma';

async function checkUserStatus() {
    const email = 'test2@gmail.com';

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            status: true,
            role: true,
        }
    });

    if (!user) {
        console.log(`❌ Không tìm thấy user với email: ${email}`);
    } else {
        console.log('📋 Thông tin user:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);

        const statusLabels: Record<string, string> = {
            NORMAL: '⚪ Thường',
            PRO: '⭐ Pro',
            BANNED: '🚫 Cấm'
        };
        console.log(`   Status: ${statusLabels[user.status] || user.status}`);
    }

    await prisma.$disconnect();
}

checkUserStatus();
