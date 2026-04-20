import prisma from '../src/lib/prisma';

async function checkRegularCreators() {
    const creators = await prisma.user.findMany({
        where: {
            role: 'CREATOR',
            isPro: false,
        },
        select: {
            id: true,
            name: true,
            email: true,
            isPro: true,
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
            console.log(`   isPro: ${creator.isPro ? '✅ Pro' : '❌ Thường'}\n`);
        });
    }

    await prisma.$disconnect();
}

checkRegularCreators();
