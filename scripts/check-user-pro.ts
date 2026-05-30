import prisma from '../src/lib/prisma';

async function checkUserPro() {
    const email = 'test2@gmail.com';

    const user = await prisma.users.findUnique({
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
        console.log(`   Status: ${user.status === 'PRO' ? '✅ PRO' : '❌ NORMAL'}`);
    }

    await prisma.$disconnect();
}

checkUserPro();
