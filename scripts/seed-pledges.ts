
import { prisma } from '../src/lib/prisma';

async function main() {
  const campaignId = 'cmp3zyrw30001mfm0h7czfoqd';
  const goalAmount = 500000000;
  const targetAmount = goalAmount * 0.7; // 350,000,000
  
  const users = await prisma.user.findMany({
    take: 5
  });

  if (users.length === 0) {
    console.error('No users found to create pledges.');
    return;
  }

  console.log(`Creating pledges for campaign ${campaignId} to reach ${targetAmount}...`);

  const pledgeAmounts = [
    50000000, // 50m
    100000000, // 100m
    25000000, // 25m
    75000000, // 75m
    50000000, // 50m
    20000000, // 20m
    15000000, // 15m
    10000000, // 10m
    3000000, // 3m
    2000000, // 2m
  ]; // Total = 350,000,000

  let createdAmount = 0;
  for (let i = 0; i < pledgeAmounts.length; i++) {
    const user = users[i % users.length];
    const amount = pledgeAmounts[i];
    
    await prisma.pledge.create({
      data: {
        amount: amount,
        totalAmount: amount, // Assuming no tips/fees for sample data
        tipAmount: 0,
        platformFee: 0,
        vatAmount: 0,
        status: 'SUCCESS',
        userId: user.id,
        campaignId: campaignId,
        displayName: user.name || 'Người ủng hộ ẩn danh',
        paymentProvider: 'VNPAY',
        transactionId: `MOCK_TXN_${Date.now()}_${i}`,
        isAnonymous: false,
      }
    });
    createdAmount += amount;
  }

  // Update campaign currentAmount
  // Note: currentAmount in DB is Decimal, so we use string or number
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      currentAmount: createdAmount,
    }
  });

  console.log(`✅ Successfully created ${pledgeAmounts.length} pledges.`);
  console.log(`📊 New current amount: ${createdAmount} (${(createdAmount/goalAmount*100).toFixed(2)}%)`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
