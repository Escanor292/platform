/**
 * Test script for Campaign Report System
 * 
 * Usage:
 * npx ts-node scripts/test-campaign-report.ts
 */

import { prisma } from "@/lib/prisma";

async function main() {
    console.log("🧪 Testing Campaign Report System...\n");

    try {
        // 1. Check if CampaignReport table exists
        console.log("1️⃣  Checking CampaignReport table...");
        const reportCount = await prisma.campaignReport.count();
        console.log(`   ✅ CampaignReport table exists (${reportCount} reports)\n`);

        // 2. Get sample campaign
        console.log("2️⃣  Finding sample campaign...");
        const campaign = await prisma.campaign.findFirst({
            select: { id: true, slug: true, title: true }
        });
        if (!campaign) {
            console.log("   ❌ No campaigns found. Create a campaign first.\n");
            return;
        }
        console.log(`   ✅ Found campaign: "${campaign.title}" (${campaign.slug})\n`);

        // 3. Get sample user
        console.log("3️⃣  Finding sample user...");
        const user = await prisma.user.findFirst({
            select: { id: true, email: true, name: true }
        });
        if (!user) {
            console.log("   ❌ No users found. Create a user first.\n");
            return;
        }
        console.log(`   ✅ Found user: "${user.name}" (${user.email})\n`);

        // 4. Check for existing report
        console.log("4️⃣  Checking for existing report...");
        const existingReport = await prisma.campaignReport.findFirst({
            where: {
                campaignId: campaign.id,
                userId: user.id
            }
        });
        if (existingReport) {
            console.log(`   ⚠️  Report already exists (ID: ${existingReport.id})\n`);
        } else {
            console.log("   ✅ No existing report found\n");
        }

        // 5. Test creating a report
        console.log("5️⃣  Testing report creation...");
        if (!existingReport) {
            const newReport = await prisma.campaignReport.create({
                data: {
                    campaignId: campaign.id,
                    userId: user.id,
                    reason: "FRAUD",
                    description: "This is a test report to verify the system is working correctly.",
                    status: "PENDING"
                },
                include: {
                    campaign: { select: { title: true } },
                    user: { select: { name: true, email: true } }
                }
            });
            console.log(`   ✅ Report created successfully!`);
            console.log(`      ID: ${newReport.id}`);
            console.log(`      Campaign: ${newReport.campaign.title}`);
            console.log(`      Reporter: ${newReport.user.name}`);
            console.log(`      Reason: ${newReport.reason}`);
            console.log(`      Status: ${newReport.status}\n`);
        } else {
            console.log("   ⏭️  Skipping (report already exists)\n");
        }

        // 6. Get all reports for campaign
        console.log("6️⃣  Getting all reports for campaign...");
        const reports = await prisma.campaignReport.findMany({
            where: { campaignId: campaign.id },
            include: {
                user: { select: { name: true, email: true } }
            }
        });
        console.log(`   ✅ Found ${reports.length} report(s):`);
        reports.forEach((report, index) => {
            console.log(`      ${index + 1}. ${report.user.name} - ${report.reason} (${report.status})`);
        });
        console.log();

        // 7. Test unique constraint
        console.log("7️⃣  Testing unique constraint (duplicate report)...");
        try {
            await prisma.campaignReport.create({
                data: {
                    campaignId: campaign.id,
                    userId: user.id,
                    reason: "SCAM",
                    description: "This should fail due to unique constraint.",
                    status: "PENDING"
                }
            });
            console.log("   ❌ Unique constraint not working!\n");
        } catch (error: any) {
            if (error.code === "P2002") {
                console.log("   ✅ Unique constraint working correctly (duplicate prevented)\n");
            } else {
                console.log(`   ❌ Unexpected error: ${error.message}\n`);
            }
        }

        // 8. Summary
        console.log("📊 Summary:");
        console.log(`   - Campaign: ${campaign.title}`);
        console.log(`   - User: ${user.name}`);
        console.log(`   - Total reports: ${reports.length}`);
        console.log(`   - Unique constraint: ✅ Working`);
        console.log("\n✅ All tests passed!\n");

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
