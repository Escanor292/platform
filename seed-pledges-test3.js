const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// Dữ liệu backers giả lập (anonymous + registered)
// ============================================================
const anonymousBackers = [
    { name: 'Nguyễn Văn An', email: 'nguyenvanan@gmail.com' },
    { name: 'Trần Thị Bích', email: 'tranthib@yahoo.com' },
    { name: 'Lê Hoàng Nam', email: 'lehoangnam@gmail.com' },
    { name: 'Phạm Minh Châu', email: 'phamchau88@gmail.com' },
    { name: 'Võ Thị Dung', email: 'vothidung@gmail.com' },
    { name: 'Đỗ Quốc Hùng', email: 'doquochung@outlook.com' },
    { name: 'Hoàng Thị Lan', email: 'hoangthilan@gmail.com' },
    { name: 'Bùi Văn Minh', email: 'buivanminh@gmail.com' },
    { name: 'Ngô Thị Nga', email: 'ngothinga@gmail.com' },
    { name: 'Lý Thành Phát', email: 'lythanhphat@gmail.com' },
    { name: 'Đặng Quỳnh Anh', email: 'dangqanhh@gmail.com' },
    { name: 'Tô Minh Khoa', email: 'tominhkhoa@gmail.com' },
    { name: 'Phan Thị Hoa', email: 'phanthihoa@gmail.com' },
    { name: 'Trương Công Danh', email: 'truongdanh@gmail.com' },
    { name: 'Mai Thị Thu', email: 'maithu@gmail.com' },
    { name: 'Đinh Văn Tú', email: 'dinhvantu@gmail.com' },
    { name: 'Chu Thị Yến', email: 'chuthiyen@gmail.com' },
    { name: 'Lưu Minh Đức', email: 'luuminhduc@gmail.com' },
    { name: 'Vũ Thị Hương', email: 'vuthihuong@gmail.com' },
    { name: 'Hà Văn Long', email: 'havanlong@gmail.com' },
    { name: 'Công ty ABC Corp', email: 'contact@abccorp.vn' },
    { name: 'Doanh nghiệp XYZ', email: 'info@xyz.vn' },
    { name: 'Người ủng hộ ẩn danh', email: null },
    { name: 'Ẩn danh', email: null },
    { name: 'Mạnh Thường Quân', email: null },
];

// Hàm random từ mảng
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Hàm random số trong khoảng
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Hàm tạo transaction ID duy nhất
function genTxId(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Hàm tạo ngày ngẫu nhiên trong khoảng
function randomDate(daysAgo, daysAgoMin = 0) {
    const ms = randomBetween(daysAgoMin * 24 * 60 * 60 * 1000, daysAgo * 24 * 60 * 60 * 1000);
    return new Date(Date.now() - ms);
}

async function seedPledges() {
    try {
        console.log('\n💰 BẮT ĐẦU TẠO LỊCH SỬ ỦNG HỘ\n');
        console.log('='.repeat(60));

        // Lấy tất cả campaigns của test3
        const campaigns = await prisma.campaign.findMany({
            where: { creator: { email: 'test3@gmail.com' } },
            include: { rewards: true }
        });

        if (campaigns.length === 0) {
            console.log('❌ Không tìm thấy campaigns! Chạy seed-test3-campaigns.js trước.');
            return;
        }

        // Lấy users hiện có để làm registered backers
        const existingUsers = await prisma.user.findMany({
            where: { email: { not: 'test3@gmail.com' } },
            select: { id: true, name: true, email: true }
        });

        console.log(`✅ Tìm thấy ${campaigns.length} campaigns và ${existingUsers.length} registered users\n`);

        let totalPledges = 0;

        // ================================================================
        // Cấu hình số lượng pledge cho từng campaign
        // ================================================================
        const pledgeConfig = [
            // [slug_pattern, minPledges, maxPledges, minAmount, maxAmount]
            { slug: 'thu-vien-sach', count: 45, amounts: [50000, 100000, 200000, 500000, 1000000, 5000000] },
            { slug: 'xe-cuu-thuong', count: 38, amounts: [100000, 200000, 500000, 1000000, 2000000, 10000000] },
            { slug: 'trong-1-trieu', count: 120, amounts: [50000, 100000, 200000, 400000, 1000000, 3000000, 50000000] },
            { slug: 'app-hoc-tieng', count: 22, amounts: [100000, 300000, 500000, 1000000, 3000000] },
            { slug: 'album-nhac', count: 68, amounts: [100000, 200000, 300000, 500000, 1000000, 2000000, 20000000] },
            { slug: 'hop-tac-xa', count: 18, amounts: [200000, 500000, 1000000, 5000000, 10000000, 100000000] },
        ];

        for (const campaign of campaigns) {
            // Tìm config cho campaign này
            const config = pledgeConfig.find(c => campaign.slug.includes(c.slug));
            if (!config) continue;

            console.log(`\n📦 Tạo pledges cho: "${campaign.title}"`);
            console.log('─'.repeat(50));

            const pledges = [];
            const FEE_RATE = 0.08;
            const VAT_RATE = 0.1;
            const TIP_OPTIONS = [0, 0, 0, 10000, 20000, 50000, 100000];

            for (let i = 0; i < config.count; i++) {
                // Random backer (anonymous hoặc registered)
                const isRegistered = existingUsers.length > 0 && Math.random() > 0.6;
                const isAnonymous = Math.random() < 0.1;

                let backer;
                let userId = null;

                if (isRegistered) {
                    backer = pick(existingUsers);
                    userId = backer.id;
                } else {
                    backer = pick(anonymousBackers);
                }

                const amount = pick(config.amounts);
                const tipAmount = pick(TIP_OPTIONS);
                const platformFee = Math.round(amount * FEE_RATE);
                const vatAmount = Math.round(tipAmount * VAT_RATE);
                const totalAmount = amount + tipAmount + platformFee + vatAmount;

                // Chọn reward phù hợp với amount
                const eligibleRewards = campaign.rewards.filter(r => Number(r.minAmount) <= amount);
                const selectedReward = eligibleRewards.length > 0 ? pick(eligibleRewards) : null;

                // Random trạng thái (mostly SUCCESS, some PENDING, rare REFUNDED)
                const statusRand = Math.random();
                let status = 'SUCCESS';
                let refundStatus = 'NO_REFUND';
                if (statusRand < 0.05) {
                    status = 'REFUNDED';
                    refundStatus = 'COMPLETED';
                } else if (statusRand < 0.08) {
                    status = 'PENDING';
                }

                // Ngày tạo ngẫu nhiên trong khoảng campaign
                const createdAt = randomDate(60, 0);

                const pledgeData = {
                    campaignId: campaign.id,
                    userId: userId,
                    rewardId: selectedReward?.id || null,
                    displayName: isAnonymous ? 'Ẩn danh' : backer.name,
                    isAnonymous: isAnonymous,
                    email: isAnonymous ? null : backer.email,
                    amount: amount,
                    tipAmount: tipAmount,
                    platformFee: platformFee,
                    vatAmount: vatAmount,
                    totalAmount: totalAmount,
                    paymentProvider: pick(['PAYOS', 'VNPAY', 'MOMO', 'ZALOPAY']),
                    transactionId: genTxId('TXN'),
                    status: status,
                    refundStatus: refundStatus,
                    refundedAt: refundStatus === 'COMPLETED' ? new Date() : null,
                    createdAt: createdAt,
                    updatedAt: createdAt,
                    ipAddress: `14.${randomBetween(1, 255)}.${randomBetween(1, 255)}.${randomBetween(1, 255)}`,
                };

                pledges.push(pledgeData);
            }

            // Insert pledges theo batch
            let created = 0;
            for (const pledgeData of pledges) {
                try {
                    await prisma.pledge.create({ data: pledgeData });
                    created++;
                } catch (err) {
                    // Bỏ qua lỗi duplicate transactionId
                }
            }

            totalPledges += created;
            const successCount = pledges.filter(p => p.status === 'SUCCESS').length;
            const totalRaised = pledges
                .filter(p => p.status === 'SUCCESS')
                .reduce((sum, p) => sum + p.amount, 0);

            console.log(`   ✅ Đã tạo ${created}/${config.count} pledges`);
            console.log(`   💚 Thành công: ${successCount} | 🔄 Pending: ${pledges.filter(p => p.status === 'PENDING').length} | 🔴 Refund: ${pledges.filter(p => p.status === 'REFUNDED').length}`);
            console.log(`   💰 Tổng huy động (SUCCESS): ${totalRaised.toLocaleString('vi-VN')} VNĐ`);
        }

        // ================================================================
        // Tóm tắt
        // ================================================================
        console.log('\n' + '='.repeat(60));
        console.log('🎉 HOÀN TẤT TẠO LỊCH SỬ ỦNG HỘ');
        console.log('='.repeat(60));
        console.log(`✅ Tổng số pledges đã tạo: ${totalPledges}`);

        // Kiểm tra lại
        const summary = await prisma.campaign.findMany({
            where: { creator: { email: 'test3@gmail.com' } },
            select: {
                title: true,
                currentAmount: true,
                goalAmount: true,
                _count: { select: { pledges: true } },
                pledges: {
                    select: { status: true, amount: true },
                }
            }
        });

        console.log('\n📊 THỐNG KÊ THEO CHIẾN DỊCH:\n');
        summary.forEach(c => {
            const success = c.pledges.filter(p => p.status === 'SUCCESS');
            const pending = c.pledges.filter(p => p.status === 'PENDING');
            const refunded = c.pledges.filter(p => p.status === 'REFUNDED');
            const raised = success.reduce((s, p) => s + Number(p.amount), 0);
            const goal = Number(c.goalAmount);

            console.log(`📌 ${c.title}`);
            console.log(`   Tổng pledges: ${c._count.pledges} (✅${success.length} | ⏳${pending.length} | 🔄${refunded.length})`);
            console.log(`   Đã huy động: ${raised.toLocaleString('vi-VN')} / ${goal.toLocaleString('vi-VN')} VNĐ (${Math.round(raised / goal * 100)}%)\n`);
        });

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedPledges();
