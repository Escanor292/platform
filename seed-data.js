const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🌱 Seeding database...\n');

        // 1. Create users
        console.log('👥 Creating users...');
        const creator = await prisma.user.create({
            data: {
                email: 'creator@example.com',
                password: 'hashed_password_123', // In production, use bcrypt
                name: 'Nguyễn Văn A',
                displayName: 'Creator A',
                role: 'CREATOR',
                status: 'NORMAL',
            },
        });

        const backer1 = await prisma.user.create({
            data: {
                email: 'backer1@example.com',
                password: 'hashed_password_456',
                name: 'Trần Thị B',
                displayName: 'Backer B',
                role: 'BACKER',
                status: 'NORMAL',
            },
        });

        const backer2 = await prisma.user.create({
            data: {
                email: 'backer2@example.com',
                password: 'hashed_password_789',
                name: 'Lê Văn C',
                displayName: 'Backer C',
                role: 'BACKER',
                status: 'NORMAL',
            },
        });

        const admin = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                password: 'hashed_password_admin',
                name: 'Admin User',
                displayName: 'Admin',
                role: 'ADMIN',
                status: 'NORMAL',
                isAdmin: true,
            },
        });

        console.log(`  ✅ Created 4 users`);
        console.log(`     - Creator: ${creator.email}`);
        console.log(`     - Backer 1: ${backer1.email}`);
        console.log(`     - Backer 2: ${backer2.email}`);
        console.log(`     - Admin: ${admin.email}`);

        // 2. Create campaigns
        console.log('\n📢 Creating campaigns...');
        const campaign1 = await prisma.campaign.create({
            data: {
                campaignCode: 'CAMP-001',
                slug: 'dự-án-ứng-dụng-mobile',
                title: 'Ứng Dụng Mobile Quản Lý Tài Chính',
                description: 'Ứng dụng giúp quản lý chi tiêu hàng ngày',
                longDescription: 'Ứng dụng di động giúp người dùng quản lý chi tiêu, lập ngân sách và theo dõi tài chính cá nhân một cách dễ dàng.',
                imageUrl: 'https://via.placeholder.com/400x300?text=Finance+App',
                type: 'REWARD',
                category: 'Technology',
                tags: ['mobile', 'finance', 'app'],
                goalAmount: new Decimal('50000000'), // 50 triệu
                currentAmount: new Decimal('0'),
                status: 'ACTIVE',
                creatorId: creator.id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
        });

        const campaign2 = await prisma.campaign.create({
            data: {
                campaignCode: 'CAMP-002',
                slug: 'dự-án-sách-công-nghệ',
                title: 'Xuất Bản Sách: Hành Trình Lập Trình',
                description: 'Sách hướng dẫn lập trình cho người mới bắt đầu',
                longDescription: 'Cuốn sách toàn diện về lập trình, từ cơ bản đến nâng cao, với các ví dụ thực tế.',
                imageUrl: 'https://via.placeholder.com/400x300?text=Programming+Book',
                type: 'REWARD',
                category: 'Publishing',
                tags: ['book', 'programming', 'education'],
                goalAmount: new Decimal('20000000'), // 20 triệu
                currentAmount: new Decimal('0'),
                status: 'ACTIVE',
                creatorId: creator.id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
            },
        });

        console.log(`  ✅ Created 2 campaigns`);
        console.log(`     - ${campaign1.title}`);
        console.log(`     - ${campaign2.title}`);

        // 3. Create rewards
        console.log('\n🎁 Creating rewards...');
        const reward1 = await prisma.reward.create({
            data: {
                campaignId: campaign1.id,
                title: 'Early Bird - Giá Đặc Biệt',
                description: 'Truy cập sớm ứng dụng với giá ưu đãi',
                minAmount: new Decimal('100000'),
                maxQuantity: 100,
                deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            },
        });

        const reward2 = await prisma.reward.create({
            data: {
                campaignId: campaign1.id,
                title: 'Premium - Trọn Đời',
                description: 'Truy cập Premium vĩnh viễn + hỗ trợ ưu tiên',
                minAmount: new Decimal('500000'),
                maxQuantity: 50,
                deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            },
        });

        const reward3 = await prisma.reward.create({
            data: {
                campaignId: campaign2.id,
                title: 'Sách In + Ebook',
                description: 'Nhận sách in + bản ebook',
                minAmount: new Decimal('150000'),
                maxQuantity: 200,
                deliveryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
        });

        console.log(`  ✅ Created 3 rewards`);

        // 4. Create pledges
        console.log('\n💰 Creating pledges...');
        const pledge1 = await prisma.pledge.create({
            data: {
                campaignId: campaign1.id,
                userId: backer1.id,
                rewardId: reward1.id,
                displayName: backer1.displayName,
                isAnonymous: false,
                email: backer1.email,
                amount: new Decimal('100000'),
                tipAmount: new Decimal('10000'),
                vatAmount: new Decimal('1000'),
                totalAmount: new Decimal('111000'),
                paymentProvider: 'PAYOS',
                transactionId: 'PAYOS-TEST-001',
                payosOrderCode: '1234567890',
                status: 'SUCCESS',
                webhookProcessedAt: new Date(),
            },
        });

        const pledge2 = await prisma.pledge.create({
            data: {
                campaignId: campaign1.id,
                userId: backer2.id,
                rewardId: reward2.id,
                displayName: backer2.displayName,
                isAnonymous: false,
                email: backer2.email,
                amount: new Decimal('500000'),
                tipAmount: new Decimal('50000'),
                vatAmount: new Decimal('5000'),
                totalAmount: new Decimal('555000'),
                paymentProvider: 'PAYOS',
                transactionId: 'PAYOS-TEST-002',
                payosOrderCode: '1234567891',
                status: 'SUCCESS',
                webhookProcessedAt: new Date(),
            },
        });

        const pledge3 = await prisma.pledge.create({
            data: {
                campaignId: campaign2.id,
                userId: null, // Anonymous
                rewardId: reward3.id,
                displayName: 'Người Ủng Hộ Ẩn Danh',
                isAnonymous: true,
                email: null,
                amount: new Decimal('150000'),
                tipAmount: new Decimal('15000'),
                vatAmount: new Decimal('1500'),
                totalAmount: new Decimal('166500'),
                paymentProvider: 'PAYOS',
                transactionId: 'PAYOS-TEST-003',
                payosOrderCode: '1234567892',
                status: 'SUCCESS',
                webhookProcessedAt: new Date(),
            },
        });

        console.log(`  ✅ Created 3 pledges`);

        // 5. Update campaign amounts
        console.log('\n📊 Updating campaign amounts...');
        await prisma.campaign.update({
            where: { id: campaign1.id },
            data: {
                currentAmount: new Decimal('666000'), // 111000 + 555000
            },
        });

        await prisma.campaign.update({
            where: { id: campaign2.id },
            data: {
                currentAmount: new Decimal('166500'),
            },
        });

        console.log(`  ✅ Updated campaign amounts`);

        console.log('\n✅ Seeding completed!\n');
        console.log('📋 TEST ACCOUNTS:');
        console.log('  Creator:');
        console.log('    Email: creator@example.com');
        console.log('    Password: hashed_password_123');
        console.log('');
        console.log('  Backer 1:');
        console.log('    Email: backer1@example.com');
        console.log('    Password: hashed_password_456');
        console.log('');
        console.log('  Backer 2:');
        console.log('    Email: backer2@example.com');
        console.log('    Password: hashed_password_789');
        console.log('');
        console.log('  Admin:');
        console.log('    Email: admin@example.com');
        console.log('    Password: hashed_password_admin');
        console.log('');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
