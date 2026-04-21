const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🗑️  Cleaning up test data...\n');

        // 1. Get all test users
        const testEmails = [
            'creator@example.com',
            'backer1@example.com',
            'backer2@example.com',
            'admin@example.com'
        ];

        console.log('👥 Finding test users...');
        const testUsers = await prisma.user.findMany({
            where: {
                email: {
                    in: testEmails
                }
            }
        });

        if (testUsers.length === 0) {
            console.log('  ℹ️  No test users found');
        } else {
            console.log(`  ✅ Found ${testUsers.length} test users`);
            testUsers.forEach(u => {
                console.log(`     - ${u.email}`);
            });
        }

        // 2. Get campaigns created by test users
        console.log('\n📢 Finding campaigns created by test users...');
        const testUserIds = testUsers.map(u => u.id);

        const campaignsToDelete = await prisma.campaign.findMany({
            where: {
                creatorId: {
                    in: testUserIds
                }
            }
        });

        if (campaignsToDelete.length === 0) {
            console.log('  ℹ️  No campaigns found');
        } else {
            console.log(`  ✅ Found ${campaignsToDelete.length} campaigns to delete`);
            campaignsToDelete.forEach(c => {
                console.log(`     - ${c.title}`);
            });
        }

        // 3. Get pledges from test users
        console.log('\n💰 Finding pledges from test users...');
        const pledgesToDelete = await prisma.pledge.findMany({
            where: {
                userId: {
                    in: testUserIds
                }
            }
        });

        if (pledgesToDelete.length === 0) {
            console.log('  ℹ️  No pledges found');
        } else {
            console.log(`  ✅ Found ${pledgesToDelete.length} pledges to delete`);
        }

        // 4. Get all pledges for campaigns created by test users
        console.log('\n💰 Finding all pledges for test campaigns...');
        const campaignIds = campaignsToDelete.map(c => c.id);
        const allCampaignPledges = await prisma.pledge.findMany({
            where: {
                campaignId: {
                    in: campaignIds
                }
            }
        });

        if (allCampaignPledges.length === 0) {
            console.log('  ℹ️  No pledges found');
        } else {
            console.log(`  ✅ Found ${allCampaignPledges.length} pledges for test campaigns`);
        }

        // 5. Confirm deletion
        console.log('\n⚠️  WARNING: This will delete:');
        console.log(`  - ${testUsers.length} users`);
        console.log(`  - ${campaignsToDelete.length} campaigns`);
        console.log(`  - ${allCampaignPledges.length} pledges (including anonymous)`);
        console.log(`  - All related data (rewards, audit logs, etc.)`);
        console.log('\n');

        // 6. Delete data
        console.log('🗑️  Deleting data...\n');

        // Delete all pledges for test campaigns (including anonymous)
        if (allCampaignPledges.length > 0) {
            console.log(`  Deleting ${allCampaignPledges.length} pledges...`);
            await prisma.pledge.deleteMany({
                where: {
                    campaignId: {
                        in: campaignIds
                    }
                }
            });
            console.log('  ✅ Pledges deleted');
        }

        // Delete pledges from test users (if any remain)
        if (pledgesToDelete.length > 0) {
            console.log(`  Deleting ${pledgesToDelete.length} pledges from test users...`);
            await prisma.pledge.deleteMany({
                where: {
                    userId: {
                        in: testUserIds
                    }
                }
            });
            console.log('  ✅ User pledges deleted');
        }

        // Delete campaigns (will cascade delete rewards, updates, etc.)
        if (campaignsToDelete.length > 0) {
            console.log(`  Deleting ${campaignsToDelete.length} campaigns...`);
            await prisma.campaign.deleteMany({
                where: {
                    creatorId: {
                        in: testUserIds
                    }
                }
            });
            console.log('  ✅ Campaigns deleted');
        }

        // Delete users
        if (testUsers.length > 0) {
            console.log(`  Deleting ${testUsers.length} users...`);
            await prisma.user.deleteMany({
                where: {
                    email: {
                        in: testEmails
                    }
                }
            });
            console.log('  ✅ Users deleted');
        }

        // 7. Verify deletion
        console.log('\n✅ Cleanup completed!\n');

        const remainingUsers = await prisma.user.count();
        const remainingCampaigns = await prisma.campaign.count();
        const remainingPledges = await prisma.pledge.count();

        console.log('📊 Database status after cleanup:');
        console.log(`  - Total Users: ${remainingUsers}`);
        console.log(`  - Total Campaigns: ${remainingCampaigns}`);
        console.log(`  - Total Pledges: ${remainingPledges}`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
