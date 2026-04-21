const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        const totalUsers = await prisma.user.count();
        const totalCampaigns = await prisma.campaign.count();
        const totalPledges = await prisma.pledge.count();

        console.log('\n📊 DATABASE STATISTICS\n');
        console.log(`Total Users: ${totalUsers}`);
        console.log(`Total Campaigns: ${totalCampaigns}`);
        console.log(`Total Pledges: ${totalPledges}`);

        if (totalUsers > 0) {
            console.log('\n👥 USERS:');
            const users = await prisma.user.findMany({ take: 5 });
            users.forEach(u => {
                console.log(`  - ${u.email} (${u.role})`);
            });
        }

        if (totalCampaigns > 0) {
            console.log('\n📢 CAMPAIGNS:');
            const campaigns = await prisma.campaign.findMany({ take: 5 });
            campaigns.forEach(c => {
                console.log(`  - ${c.title} (${c.status})`);
            });
        }

        if (totalPledges > 0) {
            console.log('\n💰 PLEDGES:');
            const pledges = await prisma.pledge.findMany({ take: 5 });
            pledges.forEach(p => {
                console.log(`  - ${p.displayName}: ${p.amount} VND (${p.status})`);
            });
        }

        console.log('\n');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
