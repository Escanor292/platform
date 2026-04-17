import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Danh sách tên người ủng hộ mẫu
const backerNames = [
  'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E',
  'Vũ Thị F', 'Đặng Văn G', 'Bùi Thị H', 'Đỗ Văn I', 'Ngô Thị K',
  'Dương Văn L', 'Lý Thị M', 'Mai Văn N', 'Võ Thị O', 'Phan Văn P',
  'Tô Thị Q', 'Trương Văn R', 'Đinh Thị S', 'Hồ Văn T', 'Chu Thị U'
];

const providers = ['SEPAY', 'VNPAY', 'MOMO', 'PAYOS'];

async function main() {
  console.log('🔍 Finding campaigns with funding...');
  
  const campaigns = await prisma.campaign.findMany({
    where: {
      creatorId: (await prisma.user.findUnique({ where: { email: 'test2@gmail.com' } }))!.id,
      currentAmount: { gt: 0 }
    },
    select: {
      id: true,
      title: true,
      campaignCode: true,
      currentAmount: true,
      goalAmount: true
    }
  });

  console.log(`✅ Found ${campaigns.length} campaigns with funding\n`);

  for (const campaign of campaigns) {
    console.log(`📊 Creating pledges for: ${campaign.title}`);
    console.log(`   Current amount: ${campaign.currentAmount.toLocaleString()} VND`);
    
    // Tính số lượng pledges dựa trên currentAmount
    const avgPledge = 1000000; // 1 triệu trung bình
    const numPledges = Math.max(5, Math.floor(Number(campaign.currentAmount) / avgPledge));
    
    console.log(`   Creating ${numPledges} pledges...`);
    
    // Tạo các pledges với số tiền ngẫu nhiên
    const pledgeAmounts = [];
    let totalCreated = 0;
    
    for (let i = 0; i < numPledges; i++) {
      // Số tiền ngẫu nhiên: 500k, 1tr, 2tr, 5tr
      const amounts = [500000, 1000000, 2000000, 5000000];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      pledgeAmounts.push(amount);
      totalCreated += amount;
    }
    
    // Điều chỉnh pledge cuối cùng để tổng khớp với currentAmount
    const diff = Number(campaign.currentAmount) - totalCreated;
    if (diff !== 0 && pledgeAmounts.length > 0) {
      pledgeAmounts[pledgeAmounts.length - 1] += diff;
    }
    
    // Tạo pledges
    for (let i = 0; i < pledgeAmounts.length; i++) {
      const amount = pledgeAmounts[i];
      const tipAmount = Math.round(amount * 0.05); // 5% tip
      const platformFee = Math.round(amount * 0.08); // 8% phí
      const vatAmount = Math.round(platformFee * 0.1); // 10% VAT
      const totalAmount = amount + tipAmount + platformFee + vatAmount;
      
      const isAnonymous = Math.random() > 0.7; // 30% ẩn danh
      const backerName = isAnonymous ? 'Ẩn danh' : backerNames[i % backerNames.length];
      
      await prisma.pledge.create({
        data: {
          campaignId: campaign.id,
          displayName: backerName,
          isAnonymous,
          email: isAnonymous ? undefined : `backer${i}@example.com`,
          phoneNumber: isAnonymous ? undefined : `09${Math.floor(10000000 + Math.random() * 90000000)}`,
          amount,
          tipAmount,
          platformFee,
          vatAmount,
          totalAmount,
          paymentProvider: providers[Math.floor(Math.random() * providers.length)],
          transactionId: `TXN-${campaign.campaignCode}-${Date.now()}-${i}`,
          status: 'SUCCESS',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          deviceInfo: {
            browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
            os: ['Windows', 'MacOS', 'iOS', 'Android'][Math.floor(Math.random() * 4)]
          },
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random trong 30 ngày qua
        }
      });
    }
    
    console.log(`   ✅ Created ${pledgeAmounts.length} pledges\n`);
  }

  console.log('🎉 All pledges created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
