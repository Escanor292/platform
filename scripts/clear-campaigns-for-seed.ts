import prisma from '@/lib/prisma';

/**
 * Clear all campaigns, pledges, rewards, and related data
 * Useful before running seed script
 */
async function main() {
    try {
        console.log('🗑️  Clearing campaign data...\n');

        // Delete in order of dependencies
        console.log('  Deleting pledges...');
        const pledgesDeleted = await prisma.pledges.deleteMany({});
        console.log(`    ✅ Deleted ${pledgesDeleted.count} pledges`);

        console.log('  Deleting rewards...');
        const rewardsDeleted = await prisma.rewards.deleteMany({});
        console.log(`    ✅ Deleted ${rewardsDeleted.count} rewards`);

        console.log('  Deleting campaign updates...');
        const updatesDeleted = await prisma.campaign_updates.deleteMany({});
        console.log(`    ✅ Deleted ${updatesDeleted.count} campaign updates`);

        console.log('  Deleting campaign followers...');
        const followersDeleted = await prisma.campaign_followers.deleteMany({});
        console.log(`    ✅ Deleted ${followersDeleted.count} campaign followers`);

        console.log('  Deleting campaign reports...');
        const reportsDeleted = await prisma.campaign_reports.deleteMany({});
        console.log(`    ✅ Deleted ${reportsDeleted.count} campaign reports`);

        console.log('  Deleting reviews...');
        const reviewsDeleted = await prisma.reviews.deleteMany({});
        console.log(`    ✅ Deleted ${reviewsDeleted.count} reviews`);

        console.log('  Deleting platform invoices...');
        const invoicesDeleted = await prisma.platform_invoices.deleteMany({});
        console.log(`    ✅ Deleted ${invoicesDeleted.count} platform invoices`);

        console.log('  Deleting campaigns...');
        const campaignsDeleted = await prisma.campaigns.deleteMany({});
        console.log(`    ✅ Deleted ${campaignsDeleted.count} campaigns`);

        console.log('\n✅ Campaign data cleared successfully!\n');

    } catch (error) {
        console.error('❌ Error clearing data:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
