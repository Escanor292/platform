import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing all campaigns and related data...');
  
  try {
    // Xóa theo thứ tự để tránh foreign key constraint
    console.log('  Deleting backer invoices...');
    await prisma.backerInvoice.deleteMany({});
    
    console.log('  Deleting audit logs...');
    await prisma.auditLog.deleteMany({});
    
    console.log('  Deleting pledges...');
    await prisma.pledge.deleteMany({});
    
    console.log('  Deleting campaign updates...');
    await prisma.campaignUpdate.deleteMany({});
    
    console.log('  Deleting reviews...');
    await prisma.review.deleteMany({});
    
    console.log('  Deleting rewards...');
    await prisma.reward.deleteMany({});
    
    console.log('  Deleting platform invoices...');
    await prisma.platformInvoice.deleteMany({});
    
    console.log('  Deleting campaigns...');
    const deletedCampaigns = await prisma.campaign.deleteMany({});
    
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
