const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Bắt đầu setup dữ liệu production...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('123', 10);

    // 1. Xóa dữ liệu cũ
    console.log('🧹 Xóa dữ liệu cũ...');
    await prisma.blogComment.deleteMany({});
    await prisma.blogReport.deleteMany({});
    await prisma.blogLike.deleteMany({});
    await prisma.blogBookmark.deleteMany({});
    await prisma.blogPostTag.deleteMany({});
    await prisma.blogPostCategory.deleteMany({});
    await prisma.blogPost.deleteMany({});
    await prisma.blogTag.deleteMany({});
    await prisma.blogCategory.deleteMany({});
    await prisma.campaignUpdate.deleteMany({});
    await prisma.campaignFollower.deleteMany({});
    await prisma.userBadge.deleteMany({});
    await prisma.badge.deleteMany({});
    await prisma.campaignReport.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.backerInvoice.deleteMany({});
    await prisma.pledge.deleteMany({});
    await prisma.reward.deleteMany({});
    await prisma.campaign.deleteMany({});
    await prisma.platformInvoice.deleteMany({});
    await prisma.dailyTipInvoice.deleteMany({});
    await prisma.kYCInfo.deleteMany({});
    await prisma.transactionLimit.deleteMany({});
    await prisma.blacklist.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Đã xóa\n');

    // 2. Tạo 4 test accounts
    console.log('👥 Tạo test accounts...');

    const test1 = await prisma.user.create({
        data: {
            email: 'test1@gmail.com',
            password: hashedPassword,
            name: 'Test Backer',
            role: 'BACKER',
            status: 'NORMAL',
        }
    });

    const test2 = await prisma.user.create({
        data: {
            email: 'test2@gmail.com',
            password: hashedPassword,
            name: 'Test Creator',
            role: 'CREATOR',
            status: 'NORMAL',
        }
    });

    const test3 = await prisma.user.create({
        data: {
            email: 'test3@gmail.com',
            password: hashedPassword,
            name: 'Test Creator Pro',
            role: 'CREATOR',
            status: 'PRO',
        }
    });

    const admin = await prisma.user.create({
        data: {
            email: 'admin@gmail.com',
            password: hashedPassword,
            name: 'Admin',
            role: 'ADMIN',
            status: 'PRO',
            isAdmin: true,
        }
    });

    console.log('✅ Đã tạo 4 accounts\n');

    // 3. Tạo 9 campaigns cho test3
    console.log('📢 Tạo 9 campaigns...');

    const campaignsData = [
        { code: 'CAMP-001', slug: 'ung-dung-tai-chinh', title: 'Ứng Dụng Quản Lý Tài Chính', goal: 50000000, current: 35000000, status: 'ACTIVE', rewards: 3 },
        { code: 'CAMP-002', slug: 'sach-lap-trinh', title: 'Sách Lập Trình Zero To Hero', goal: 30000000, current: 3000000, status: 'ACTIVE', rewards: 2 },
        { code: 'CAMP-003', slug: 'vuon-xanh', title: 'Vườn Xanh Khu Phố', goal: 20000000, current: 20500000, status: 'SUCCESS', rewards: 0 },
        { code: 'CAMP-004', slug: 'trien-lam-nghe-thuat', title: 'Triển Lãm Nghệ Thuật', goal: 40000000, current: 34000000, status: 'ACTIVE', rewards: 4 },
        { code: 'CAMP-005', slug: 'quy-tu-thien', title: 'Quỹ Từ Thiện Trẻ Em', goal: 100000000, current: 7000000, status: 'ACTIVE', rewards: 2 },
        { code: 'CAMP-006', slug: 'phim-tai-lieu', title: 'Phim Tài Liệu Thủ Công', goal: 80000000, current: 62000000, status: 'ACTIVE', rewards: 2 },
        { code: 'CAMP-007', slug: 'khoa-hoc-web', title: 'Khóa Học Lập Trình Web', goal: 25000000, current: 19000000, status: 'ACTIVE', rewards: 5 },
        { code: 'CAMP-008', slug: 'pin-mat-troi', title: 'Pin Mặt Trời Gia Đình', goal: 150000000, current: 12000000, status: 'ACTIVE', rewards: 3 },
        { code: 'CAMP-009', slug: 'app-tieng-anh-ai', title: 'App Học Tiếng Anh AI', goal: 60000000, current: 88000000, status: 'SUCCESS', rewards: 0 },
    ];

    const campaigns = [];
    for (const data of campaignsData) {
        const campaign = await prisma.campaign.create({
            data: {
                campaignCode: data.code,
                slug: data.slug,
                title: data.title,
                description: `Mô tả cho ${data.title}`,
                category: 'Công Nghệ',
                goalAmount: data.goal,
                currentAmount: data.current,
                status: data.status,
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                creatorId: test3.id,
            }
        });
        campaigns.push({ ...campaign, rewardsCount: data.rewards });
        console.log(`   ✅ ${campaign.title}`);
    }
    console.log('');

    // 4. Tạo rewards
    console.log('🎁 Tạo rewards...');
    let totalRewards = 0;
    for (const campaign of campaigns) {
        if (campaign.rewardsCount > 0) {
            for (let i = 0; i < campaign.rewardsCount; i++) {
                await prisma.reward.create({
                    data: {
                        campaignId: campaign.id,
                        title: `Gói ${i + 1}`,
                        minAmount: (i + 1) * 100000,
                        maxQuantity: 100,
                    }
                });
                totalRewards++;
            }
        }
    }
    console.log(`✅ Đã tạo ${totalRewards} rewards\n`);

    // 5. Tạo backers và pledges
    console.log('💰 Tạo pledges...');
    const backers = [];
    for (let i = 1; i <= 30; i++) {
        const backer = await prisma.user.create({
            data: {
                email: `backer${i}@example.com`,
                password: hashedPassword,
                name: `Backer ${i}`,
                role: 'BACKER',
            }
        });
        backers.push(backer);
    }

    let totalPledges = 0;
    for (const campaign of campaigns) {
        const numPledges = Math.floor(Math.random() * 20) + 5;
        for (let i = 0; i < numPledges; i++) {
            const backer = backers[Math.floor(Math.random() * backers.length)];
            const amount = [100000, 200000, 500000, 1000000][Math.floor(Math.random() * 4)];
            await prisma.pledge.create({
                data: {
                    campaignId: campaign.id,
                    userId: backer.id,
                    displayName: backer.name,
                    amount: amount,
                    totalAmount: amount * 1.13,
                    paymentProvider: 'PAYOS',
                    transactionId: `TXN-${Date.now()}-${i}-${campaign.id}`,
                    status: 'SUCCESS',
                }
            });
            totalPledges++;
        }
    }
    console.log(`✅ Đã tạo ${totalPledges} pledges\n`);

    // 6. Tạo followers
    console.log('👥 Tạo followers...');
    let totalFollowers = 0;
    for (const campaign of campaigns) {
        const numFollowers = Math.floor(Math.random() * 10) + 5;
        for (let i = 0; i < numFollowers; i++) {
            const follower = backers[Math.floor(Math.random() * backers.length)];
            try {
                await prisma.campaignFollower.create({
                    data: {
                        campaignId: campaign.id,
                        userId: follower.id,
                    }
                });
                totalFollowers++;
            } catch (e) { }
        }
    }
    console.log(`✅ Đã tạo ${totalFollowers} followers\n`);

    // 7. Tạo updates
    console.log('📝 Tạo updates...');
    let totalUpdates = 0;
    for (const campaign of campaigns.slice(0, 6)) {
        const numUpdates = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < numUpdates; i++) {
            await prisma.campaignUpdate.create({
                data: {
                    campaignId: campaign.id,
                    title: `Cập Nhật ${i + 1}`,
                    content: `Nội dung cập nhật ${i + 1}`,
                }
            });
            totalUpdates++;
        }
    }
    console.log(`✅ Đã tạo ${totalUpdates} updates\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ HOÀN THÀNH!\n');
    console.log('👥 Accounts (password: 123):');
    console.log('   • test1@gmail.com (BACKER)');
    console.log('   • test2@gmail.com (CREATOR)');
    console.log('   • test3@gmail.com (CREATOR PRO) ⭐');
    console.log('   • admin@gmail.com (ADMIN)\n');
    console.log(`📢 Campaigns: 9 (thuộc test3@gmail.com)`);
    console.log(`🎁 Rewards: ${totalRewards}`);
    console.log(`💰 Pledges: ${totalPledges}`);
    console.log(`👥 Followers: ${totalFollowers}`);
    console.log(`📝 Updates: ${totalUpdates}`);
    console.log('═══════════════════════════════════════════════════════\n');
}

main()
    .catch(e => {
        console.error('❌ Lỗi:', e.message);
        console.error(e);
    })
    .finally(() => prisma.$disconnect());
