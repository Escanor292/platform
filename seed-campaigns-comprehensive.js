const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');

const prisma = new PrismaClient();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generate unique campaign code: CF-YYYYMMDD-XXXXX
 */
function generateCampaignCode() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `CF-${dateStr}-${randomStr}`;
}

/**
 * Generate unique slug
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, (char) => {
            const map = {
                'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
                'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
                'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
                'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
                'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
                'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
                'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
                'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
                'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
                'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
                'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
                'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
                'đ': 'd'
            };
            return map[char] || char;
        })
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now().toString().slice(-4);
}

/**
 * Random number between min and max
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random element from array
 */
function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate random date between start and end
 */
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ============================================================
// DATA TEMPLATES
// ============================================================

const CATEGORIES = [
    'Công nghệ',
    'Giáo dục',
    'Cộng đồng',
    'Sáng tạo',
    'Từ thiện',
    'Nghệ thuật',
    'Môi trường',
    'Y tế',
    'Nông nghiệp',
    'Kinh doanh'
];

const TAGS_BY_CATEGORY = {
    'Công nghệ': ['AI', 'Mobile App', 'Web', 'IoT', 'Blockchain', 'Startup', 'SaaS'],
    'Giáo dục': ['Online Course', 'Sách', 'Workshop', 'Scholarship', 'E-learning', 'Mentorship'],
    'Cộng đồng': ['Community', 'Social', 'Networking', 'Event', 'Meetup', 'Collaboration'],
    'Sáng tạo': ['Art', 'Music', 'Film', 'Design', 'Photography', 'Writing'],
    'Từ thiện': ['Charity', 'Donation', 'Relief', 'Volunteer', 'NGO', 'Social Impact'],
    'Nghệ thuật': ['Painting', 'Sculpture', 'Exhibition', 'Performance', 'Gallery'],
    'Môi trường': ['Green', 'Sustainability', 'Climate', 'Conservation', 'Renewable'],
    'Y tế': ['Healthcare', 'Medical', 'Wellness', 'Research', 'Mental Health'],
    'Nông nghiệp': ['Farming', 'Organic', 'Sustainable', 'Rural', 'Agritech'],
    'Kinh doanh': ['Startup', 'SME', 'Franchise', 'B2B', 'E-commerce']
};

const PAYMENT_PROVIDERS = ['PAYOS', 'VNPAY', 'MOMO', 'SEPAY'];

const CAMPAIGN_TEMPLATES = [
    {
        title: 'Ứng Dụng Mobile Quản Lý Tài Chính Cá Nhân',
        shortDesc: 'Ứng dụng giúp quản lý chi tiêu hàng ngày một cách thông minh',
        longDesc: 'Ứng dụng di động tiên tiến giúp người dùng quản lý chi tiêu, lập ngân sách, theo dõi tài chính cá nhân và đạt mục tiêu tiết kiệm. Với giao diện thân thiện, tính năng phân tích chi tiết, và báo cáo tự động, bạn sẽ kiểm soát tài chính của mình tốt hơn bao giờ hết.',
        category: 'Công nghệ',
        goalAmounts: [50000000, 100000000, 150000000],
        status: 'ACTIVE'
    },
    {
        title: 'Xuất Bản Sách: Hành Trình Lập Trình Từ Zero Đến Hero',
        shortDesc: 'Cuốn sách hướng dẫn lập trình cho người mới bắt đầu',
        longDesc: 'Cuốn sách toàn diện về lập trình, từ cơ bản đến nâng cao, với hơn 500 trang nội dung, 100+ ví dụ thực tế, và các bài tập thực hành. Được viết bởi các lập trình viên có kinh nghiệm 10+ năm, sách này sẽ là người bạn đồng hành tuyệt vời trong hành trình học lập trình của bạn.',
        category: 'Giáo dục',
        goalAmounts: [20000000, 30000000, 50000000],
        status: 'ACTIVE'
    },
    {
        title: 'Dự Án Cộng Đồng: Vườn Xanh Khu Phố',
        shortDesc: 'Xây dựng vườn cộng đồng xanh cho khu phố',
        longDesc: 'Dự án nhằm xây dựng một vườn xanh cộng đồng tại khu phố, tạo không gian xanh cho cư dân, giáo dục về nông nghiệp bền vững, và tăng cường liên kết cộng đồng. Vườn sẽ có các khu vực trồng rau, hoa, cây ăn quả, và khu vực hoạt động cộng đồng.',
        category: 'Cộng đồng',
        goalAmounts: [15000000, 25000000, 40000000],
        status: 'ACTIVE'
    },
    {
        title: 'Triển Lãm Nghệ Thuật: Những Bức Tranh Từ Trái Tim',
        shortDesc: 'Triển lãm tranh sơn dầu của các họa sĩ trẻ',
        longDesc: 'Triển lãm nghệ thuật quy mô lớn giới thiệu tác phẩm sơn dầu của 20 họa sĩ trẻ tài năng. Sự kiện sẽ kéo dài 3 tháng, có các buổi talk show, workshop vẽ, và đấu giá từ thiện. Toàn bộ doanh thu sẽ được quyên góp cho các em nhỏ có hoàn cảnh khó khăn.',
        category: 'Sáng tạo',
        goalAmounts: [60000000, 100000000, 150000000],
        status: 'ACTIVE'
    },
    {
        title: 'Quỹ Từ Thiện: Hỗ Trợ Trẻ Em Vùng Cao',
        shortDesc: 'Quyên góp hỗ trợ giáo dục cho trẻ em vùng cao',
        longDesc: 'Quỹ từ thiện nhằm hỗ trợ giáo dục cho trẻ em vùng cao, bao gồm xây dựng thư viện, cung cấp sách vở, dụng cụ học tập, và học bổng cho học sinh giỏi. Mỗi đóng góp sẽ trực tiếp giúp đỡ hàng trăm em nhỏ có cơ hội học tập tốt hơn.',
        category: 'Từ thiện',
        goalAmounts: [100000000, 200000000, 300000000],
        status: 'ACTIVE'
    },
    {
        title: 'Phim Tài Liệu: Câu Chuyện Những Người Thợ Thủ Công',
        shortDesc: 'Sản xuất phim tài liệu về các nghệ nhân thủ công truyền thống',
        longDesc: 'Dự án sản xuất phim tài liệu dài 90 phút kể về cuộc sống và công việc của các nghệ nhân thủ công truyền thống. Phim sẽ được quay tại 5 tỉnh khác nhau, với chất lượng 4K, và sẽ được phát hành trên các nền tảng streaming quốc tế.',
        category: 'Sáng tạo',
        goalAmounts: [80000000, 120000000, 180000000],
        status: 'ACTIVE'
    },
    {
        title: 'Khóa Học Online: Lập Trình Web Hiện Đại',
        shortDesc: 'Khóa học online toàn diện về lập trình web',
        longDesc: 'Khóa học online gồm 50 bài giảng video, 100+ bài tập thực hành, 10 dự án thực tế, và hỗ trợ trực tiếp từ giảng viên. Học viên sẽ học được React, Node.js, MongoDB, và các công nghệ web hiện đại khác. Sau khóa học, bạn sẽ có đủ kỹ năng để xin việc làm lập trình viên.',
        category: 'Giáo dục',
        goalAmounts: [25000000, 40000000, 60000000],
        status: 'ACTIVE'
    },
    {
        title: 'Dự Án Năng Lượng Tái Tạo: Pin Mặt Trời Cho Gia Đình',
        shortDesc: 'Hệ thống pin mặt trời cho gia đình với giá phải chăng',
        longDesc: 'Dự án phát triển hệ thống pin mặt trời giá rẻ cho gia đình, giúp giảm chi phí điện năng và bảo vệ môi trường. Hệ thống được thiết kế dễ lắp đặt, bảo hành 10 năm, và có dịch vụ bảo trì miễn phí.',
        category: 'Môi trường',
        goalAmounts: [200000000, 300000000, 500000000],
        status: 'ACTIVE'
    },
    {
        title: 'Ứng Dụng Học Tiếng Anh Bằng AI',
        shortDesc: 'Ứng dụng học tiếng Anh thông minh với AI',
        longDesc: 'Ứng dụng học tiếng Anh sử dụng trí tuệ nhân tạo để cá nhân hóa lộ trình học, phát âm chuẩn, và luyện tập hội thoại với AI. Phù hợp cho mọi trình độ từ cơ bản đến nâng cao.',
        category: 'Giáo dục',
        goalAmounts: [40000000, 60000000, 80000000],
        status: 'ACTIVE'
    }
];

const REWARD_TEMPLATES = [
    {
        title: 'Cảm Ơn Đặc Biệt',
        description: 'Cảm ơn bạn đã ủng hộ dự án. Tên bạn sẽ được ghi trên trang cảm ơn.',
        minAmount: 50000,
        maxQuantity: null
    },
    {
        title: 'Sản Phẩm Đặc Biệt',
        description: 'Nhận sản phẩm đặc biệt từ dự án (nếu có).',
        minAmount: 100000,
        maxQuantity: 500
    },
    {
        title: 'Gói Cơ Bản',
        description: 'Truy cập cơ bản + hỗ trợ email.',
        minAmount: 200000,
        maxQuantity: 300
    },
    {
        title: 'Gói Nâng Cao',
        description: 'Truy cập nâng cao + hỗ trợ ưu tiên + tài liệu bổ sung.',
        minAmount: 500000,
        maxQuantity: 150
    },
    {
        title: 'Gói Premium',
        description: 'Truy cập toàn bộ + hỗ trợ VIP + tư vấn riêng.',
        minAmount: 1000000,
        maxQuantity: 50
    },
    {
        title: 'Gói Doanh Nghiệp',
        description: 'Giải pháp toàn diện cho doanh nghiệp + hỗ trợ 24/7.',
        minAmount: 5000000,
        maxQuantity: 10
    }
];

const DONOR_NAMES = [
    'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E',
    'Vũ Thị F', 'Đặng Văn G', 'Bùi Thị H', 'Dương Văn I', 'Tô Thị J',
    'Cao Văn K', 'Nông Thị L', 'Sơn Văn M', 'Tạ Thị N', 'Trương Văn O',
    'Lý Thị P', 'Mạc Văn Q', 'Tây Thị R', 'Tây Văn S', 'Tây Thị T'
];

// ============================================================
// MAIN SEEDING FUNCTION
// ============================================================

async function main() {
    try {
        console.log('🌱 Seeding comprehensive campaign data...\n');

        // 1. Get or create Creator users
        console.log('👥 Setting up Creator accounts...');
        const creators = [];

        for (let i = 1; i <= 3; i++) {
            const email = `creator${i}@example.com`;
            let creator = await prisma.user.findUnique({ where: { email } });

            if (!creator) {
                creator = await prisma.user.create({
                    data: {
                        email,
                        password: 'hashed_password_' + i,
                        name: `Người Tạo ${i}`,
                        displayName: `Creator ${i}`,
                        role: 'CREATOR',
                        status: 'NORMAL',
                        bio: `Tôi là người sáng tạo dự án thú vị. Hãy ủng hộ tôi!`,
                        location: ['Hà Nội', 'TP.HCM', 'Đà Nẵng'][i - 1]
                    }
                });
                console.log(`  ✅ Created creator: ${email}`);
            } else {
                console.log(`  ℹ️  Creator already exists: ${email}`);
            }
            creators.push(creator);
        }

        // 2. Create campaigns for each creator
        console.log('\n📢 Creating campaigns for each creator...');
        const campaigns = [];

        for (let creatorIdx = 0; creatorIdx < creators.length; creatorIdx++) {
            const creator = creators[creatorIdx];
            console.log(`\n  Creator ${creatorIdx + 1}: ${creator.name}`);

            for (let campaignIdx = 0; campaignIdx < 3; campaignIdx++) {
                const template = CAMPAIGN_TEMPLATES[creatorIdx * 3 + campaignIdx];
                const category = template.category;
                const tags = randomElement(TAGS_BY_CATEGORY[category]).split(',').map(t => t.trim());

                // Determine campaign status and dates
                let status, startDate, endDate;
                const now = new Date();

                if (campaignIdx === 0) {
                    // Campaign 1: Đang chạy, gần đạt goal (70-90%)
                    status = 'ACTIVE';
                    startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
                    endDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days from now
                } else if (campaignIdx === 1) {
                    // Campaign 2: Mới bắt đầu, rất ít người ủng hộ (5-10%)
                    status = 'ACTIVE';
                    startDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
                    endDate = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000); // 28 days from now
                } else {
                    // Campaign 3: Đã kết thúc
                    status = randomElement(['SUCCESS', 'FAILED']);
                    startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
                    endDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
                }

                const goalAmount = randomElement(template.goalAmounts);

                const campaign = await prisma.campaign.create({
                    data: {
                        campaignCode: generateCampaignCode(),
                        slug: generateSlug(template.title),
                        title: template.title,
                        description: template.shortDesc,
                        longDescription: template.longDesc,
                        imageUrl: `https://via.placeholder.com/600x400?text=${encodeURIComponent(template.title)}`,
                        type: 'REWARD',
                        category,
                        tags,
                        goalAmount: new Decimal(goalAmount),
                        currentAmount: new Decimal(0),
                        status,
                        creatorId: creator.id,
                        startDate,
                        endDate,
                        feeRate: 0.08
                    }
                });

                campaigns.push({ campaign, creatorIdx, campaignIdx, goalAmount });
                console.log(`    ✅ Campaign ${campaignIdx + 1}: ${campaign.title}`);
            }
        }

        // 3. Create rewards for each campaign
        console.log('\n🎁 Creating rewards...');
        const campaignRewards = {};

        for (const { campaign, campaignIdx } of campaigns) {
            let rewardCount;
            if (campaignIdx === 0) {
                rewardCount = randomBetween(3, 5); // 3-5 rewards
            } else if (campaignIdx === 1) {
                rewardCount = randomBetween(2, 3); // 2-3 rewards
            } else {
                rewardCount = randomBetween(0, 2); // 0-2 rewards (some without rewards)
            }

            const rewards = [];
            for (let i = 0; i < rewardCount; i++) {
                const template = REWARD_TEMPLATES[i];
                const reward = await prisma.reward.create({
                    data: {
                        campaignId: campaign.id,
                        title: template.title,
                        description: template.description,
                        minAmount: new Decimal(template.minAmount),
                        maxQuantity: template.maxQuantity,
                        deliveryDate: new Date(campaign.endDate.getTime() + 30 * 24 * 60 * 60 * 1000),
                        isActive: true
                    }
                });
                rewards.push(reward);
            }

            campaignRewards[campaign.id] = rewards;
            console.log(`  ✅ Campaign "${campaign.title}": ${rewardCount} rewards`);
        }

        // 4. Create pledges (donations) for each campaign
        console.log('\n💰 Creating pledges and donors...');
        let totalPledgesCreated = 0;

        for (const { campaign, campaignIdx, goalAmount } of campaigns) {
            let donorCount, progressPercentage;

            if (campaignIdx === 0) {
                // Campaign 1: 70-90% of goal
                progressPercentage = randomBetween(70, 90);
                donorCount = randomBetween(15, 30);
            } else if (campaignIdx === 1) {
                // Campaign 2: 5-10% of goal
                progressPercentage = randomBetween(5, 10);
                donorCount = randomBetween(2, 5);
            } else {
                // Campaign 3: 0-100% (completed or failed)
                progressPercentage = campaign.status === 'SUCCESS' ? randomBetween(100, 150) : randomBetween(20, 80);
                donorCount = randomBetween(10, 40);
            }

            const targetAmount = Math.floor((goalAmount * progressPercentage) / 100);
            let currentAmount = 0;
            const rewards = campaignRewards[campaign.id] || [];

            for (let i = 0; i < donorCount; i++) {
                const isAnonymous = Math.random() < 0.3; // 30% anonymous
                const displayName = isAnonymous ? 'Người Ủng Hộ Ẩn Danh' : randomElement(DONOR_NAMES);
                const email = isAnonymous ? null : `donor${i}@example.com`;

                // Random donation amount
                const amount = new Decimal(randomBetween(50000, 5000000));
                const tipPercentage = randomElement([0, 5, 10, 15]);
                const tipAmount = amount.mul(tipPercentage).div(100);
                const platformFee = amount.mul(0.08);
                const vatAmount = amount.mul(0.1);
                const totalAmount = amount.plus(tipAmount).plus(platformFee).plus(vatAmount);

                const pledge = await prisma.pledge.create({
                    data: {
                        campaignId: campaign.id,
                        userId: null, // All anonymous for simplicity
                        rewardId: rewards.length > 0 ? randomElement(rewards).id : null,
                        displayName,
                        isAnonymous,
                        email,
                        amount,
                        tipAmount,
                        platformFee,
                        vatAmount,
                        totalAmount,
                        paymentProvider: randomElement(PAYMENT_PROVIDERS),
                        transactionId: `TXN-${Date.now()}-${i}`,
                        payosOrderCode: `ORDER-${Date.now()}-${i}`,
                        status: 'SUCCESS',
                        webhookProcessedAt: new Date()
                    }
                });

                currentAmount += Number(totalAmount);
                totalPledgesCreated++;
            }

            // Update campaign current amount
            await prisma.campaign.update({
                where: { id: campaign.id },
                data: {
                    currentAmount: new Decimal(Math.min(currentAmount, targetAmount))
                }
            });

            console.log(`  ✅ Campaign "${campaign.title}": ${donorCount} pledges, ${progressPercentage}% of goal`);
        }

        // 5. Create campaign followers
        console.log('\n👥 Creating campaign followers...');
        for (const { campaign } of campaigns) {
            const followerCount = randomBetween(5, 20);
            for (let i = 0; i < followerCount; i++) {
                const isAnonymous = Math.random() < 0.4;
                await prisma.campaignFollower.create({
                    data: {
                        campaignId: campaign.id,
                        userId: null,
                        email: isAnonymous ? null : `follower${i}@example.com`
                    }
                }).catch(() => { }); // Ignore duplicates
            }
            console.log(`  ✅ Campaign "${campaign.title}": ${followerCount} followers`);
        }

        // 6. Create campaign updates
        console.log('\n📝 Creating campaign updates...');
        for (const { campaign } of campaigns) {
            if (campaign.status === 'ACTIVE') {
                const updateCount = randomBetween(2, 4);
                for (let i = 0; i < updateCount; i++) {
                    await prisma.campaignUpdate.create({
                        data: {
                            campaignId: campaign.id,
                            title: `Cập nhật tiến độ #${i + 1}`,
                            content: `Chúng tôi vừa hoàn thành giai đoạn ${i + 1} của dự án. Cảm ơn sự ủng hộ của bạn!`,
                            tags: ['update', 'progress'],
                            isPinned: i === 0
                        }
                    });
                }
                console.log(`  ✅ Campaign "${campaign.title}": ${updateCount} updates`);
            }
        }

        console.log('\n✅ Seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`  - Creators: 3`);
        console.log(`  - Campaigns: 9 (3 per creator)`);
        console.log(`  - Total Pledges: ${totalPledgesCreated}`);
        console.log(`  - Campaign Variations:`);
        console.log(`    • Campaign 1: Active, 70-90% funded`);
        console.log(`    • Campaign 2: Active, 5-10% funded`);
        console.log(`    • Campaign 3: Completed/Failed`);
        console.log('\n📋 Test Accounts:');
        for (let i = 1; i <= 3; i++) {
            console.log(`  Creator ${i}:`);
            console.log(`    Email: creator${i}@example.com`);
            console.log(`    Password: hashed_password_${i}`);
        }
        console.log('');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
