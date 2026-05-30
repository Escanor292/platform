import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing all campaigns and related data...');

  try {
    // Xóa theo thứ tự để tránh foreign key constraint
    console.log('  Deleting backer invoices...');
    await prisma.backer_invoices.deleteMany({});

    console.log('  Deleting audit logs...');
    await prisma.audit_logs.deleteMany({});

    console.log('  Deleting pledges...');
    await prisma.pledges.deleteMany({});

    console.log('  Deleting campaign updates...');
    await prisma.campaign_updates.deleteMany({});

    console.log('  Deleting reviews...');
    await prisma.reviews.deleteMany({});

    console.log('  Deleting rewards...');
    await prisma.rewards.deleteMany({});

    console.log('  Deleting platform invoices...');
    await prisma.platform_invoices.deleteMany({});

    console.log('  Deleting campaigns...');
    const deletedCampaigns = await prisma.campaigns.deleteMany({});

    console.log('\n✅ All campaigns cleared successfully!');
    console.log(`   Total campaigns deleted: ${deletedCampaigns.count}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
