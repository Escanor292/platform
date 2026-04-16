/**
 * Script test Campaign Code generation
 * Chạy: npx ts-node scripts/test-campaign-code.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function generateUniqueCampaignCode(): Promise<string> {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const campaignCode = `CF-${dateStr}-${randomStr}`;
    
    // Kiểm tra xem code đã tồn tại chưa
    const existing = await prisma.campaign.findUnique({
      where: { campaignCode }
    });
    
    if (!existing) {
      return campaignCode;
    }
    
    attempts++;
  }
  
  // Nếu sau 10 lần vẫn trùng, thêm timestamp để đảm bảo unique
  const timestamp = Date.now().toString().slice(-5);
  return `CF-${dateStr}-${timestamp}`;
}

async function testCampaignCodeGeneration() {
  console.log("🧪 Testing Campaign Code Generation...\n");

  // Test 1: Generate multiple codes
  console.log("Test 1: Generate 5 campaign codes");
  const codes: string[] = [];
  for (let i = 0; i < 5; i++) {
    const code = await generateUniqueCampaignCode();
    codes.push(code);
    console.log(`  ${i + 1}. ${code}`);
  }

  // Test 2: Check uniqueness
  console.log("\nTest 2: Check uniqueness");
  const uniqueCodes = new Set(codes);
  if (uniqueCodes.size === codes.length) {
    console.log("  ✅ All codes are unique");
  } else {
    console.log("  ❌ Duplicate codes found!");
  }

  // Test 3: Check format
  console.log("\nTest 3: Check format (CF-YYYYMMDD-XXXXX)");
  const pattern = /^CF-\d{8}-[A-Z0-9]{5}$/;
  let allValid = true;
  for (const code of codes) {
    const isValid = pattern.test(code);
    console.log(`  ${code}: ${isValid ? "✅" : "❌"}`);
    if (!isValid) allValid = false;
  }

  // Test 4: Check existing campaigns
  console.log("\nTest 4: Check existing campaigns in database");
  const campaigns = await prisma.campaign.findMany({
    select: {
      id: true,
      title: true,
      campaignCode: true,
    },
    take: 5,
  });

  if (campaigns.length === 0) {
    console.log("  ⚠️  No campaigns found in database");
  } else {
    console.log(`  Found ${campaigns.length} campaigns:`);
    for (const campaign of campaigns) {
      console.log(`    - ${campaign.campaignCode}: ${campaign.title}`);
    }
  }

  // Test 5: Check for duplicates in database
  console.log("\nTest 5: Check for duplicate campaign codes in database");
  const allCampaigns = await prisma.campaign.findMany({
    select: { campaignCode: true },
  });
  
  const codeMap = new Map<string, number>();
  for (const campaign of allCampaigns) {
    const count = codeMap.get(campaign.campaignCode) || 0;
    codeMap.set(campaign.campaignCode, count + 1);
  }

  const duplicates = Array.from(codeMap.entries()).filter(([_, count]) => count > 1);
  if (duplicates.length === 0) {
    console.log("  ✅ No duplicate campaign codes in database");
  } else {
    console.log("  ❌ Found duplicate campaign codes:");
    for (const [code, count] of duplicates) {
      console.log(`    - ${code}: ${count} times`);
    }
  }

  console.log("\n✅ Test completed!");
}

testCampaignCodeGeneration()
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
