const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const campaigns = await prisma.campaign.findMany({
        where: { creator: { email: 'test3@gmail.com' } },
        select: { id: true, title: true, slug: true, _count: { select: { pledges: true } } }
    });

    console.log('=== Campaigns của test3@gmail.com ===');
    campaigns.forEach(c => console.log(c.title + ': ' + c._count.pledges + ' pledges'));

    const backers = await prisma.user.findMany({
        where: { email: { not: 'test3@gmail.com' } },
        select: { id: true, name: true, email: true, role: true },
        take: 15
    });

    console.log('\n=== Danh sách users khác (potential backers) ===');
    backers.forEach(u => console.log(u.name + ' (' + u.email + ') - ' + u.role));

    await prisma.$disconnect();
}
check().catch(console.error);
