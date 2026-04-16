/**
 * Script to clear all campaigns from database
 * Run: npx ts-node scripts/clear-campaigns.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearCampaigns() {
  console.log("🗑️  Clearing all campaigns...\n");

  try {
    // Delete in order due to foreign key constraints
    
    // 1. Delete campaign updates
    try {
      const deletedUpdates = await prisma.campaignUpdate.deleteMany({});
      console.log(`✅ Deleted ${deletedUpdates.count} campaign updates`);
    } catch (e) {
      console.log(`⚠️  Skipped campaign updates (table may not exist)`);
    }

    // 2. Delete reviews
    try {
      const deletedReviews = await prisma.review.deleteMany({
        where: { campaignId: { not: null } }
      });
      console.log(`✅ Deleted ${deletedReviews.count} reviews`);
    } catch (e) {
      console.log(`⚠️  Skipped reviews (table may not exist)`);
    }

    // 3. Delete rewards
    try {
      const deletedRewards = await prisma.reward.deleteMany({});
      console.log(`✅ Deleted ${deletedRewards.count} rewards`);
    } catch (e) {
      console.log(`⚠️  Skipped rewards (table may not exist)`);
    }

    // 4. Delete backer invoices (through pledges)
    try {
      const deletedBackerInvoices = await prisma.backerInvoice.deleteMany({});
      console.log(`✅ Deleted ${deletedBackerInvoices.count} backer invoices`);
    } catch (e) {
      console.log(`⚠️  Skipped backer invoices (table may not exist)`);
    }

    // 5. Delete audit logs related to pledges
    try {
      const deletedAuditLogs = await prisma.auditLog.deleteMany({
        where: { entityType: "PLEDGE" }
      });
      console.log(`✅ Deleted ${deletedAuditLogs.count} audit logs`);
    } catch (e) {
      console.log(`⚠️  Skipped audit logs (table may not exist)`);
    }

    // 6. Delete pledges
    try {
      const deletedPledges = await prisma.pledge.deleteMany({});
      console.log(`✅ Deleted ${deletedPledges.count} pledges`);
    } catch (e) {
      console.log(`⚠️  Skipped pledges (table may not exist)`);
    }

    // 7. Delete platform invoices
    try {
      const deletedInvoices = await prisma.platformInvoice.deleteMany({});
      console.log(`✅ Deleted ${deletedInvoices.count} platform invoices`);
    } catch (e) {
      console.log(`⚠️  Skipped platform invoices (table may not exist)`);
    }

    // 8. Finally, delete campaigns
    const deletedCampaigns = await prisma.campaign.deleteMany({});
    console.log(`✅ Deleted ${deletedCampaigns.count} campaigns`);

    console.log("\n🎉 All campaigns and related data cleared successfully!");
    
  } catch (error) {
    console.error("❌ Error clearing campaigns:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearCampaigns();
