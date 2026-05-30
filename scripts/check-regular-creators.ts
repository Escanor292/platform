import prisma from '../src/lib/prisma';

async function checkRegularCreators() {
    const creators = await prisma.users.findMany({
        where: {
            role: 'CREATOR',
            status: 'NORMAL',
        },
        select: {
            id: true,
            name: true,
            email: true,
            status: true,
            role: true,
        }
    });

    console.log(`\n📋 Tìm thấy ${creators.length} CREATOR thường (không phải Pro):\n`);

    if (creators.length === 0) {
        console.log('❌ Không có CREATOR thường nào trong hệ thống');
    } else {
        creators.forEach((creator, index) => {
            console.log(`${index + 1}. ${creator.name || 'N/A'}`);
            console.log(`   Email: ${creator.email}`);
            console.log(`   ID: ${creator.id}`);
            console.log(`   Status: ${creator.status === 'PRO' ? '✅ Pro' : '❌ Thường'}\n`);
        });
    }

    await prisma.$disconnect();
}

checkRegularCreators();
