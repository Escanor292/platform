const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('\n🚀 Tạo chiến dịch mẫu cho test3@gmail.com\n');

        // Tìm user test3@gmail.com
        const creator = await prisma.user.findUnique({
            where: { email: 'test3@gmail.com' }
        });

        if (!creator) {
            console.log('❌ Không tìm thấy user test3@gmail.com');
            return;
        }

        console.log(`✅ Tìm thấy Creator: ${creator.name} (${creator.email})`);
        console.log(`   Role: ${creator.role}, Status: ${creator.status}\n`);

        // Tạo chiến dịch
        const campaign = await prisma.campaign.create({
            data: {
                campaignCode: `CF${Date.now()}`,
                slug: 'du-an-nang-luong-xanh-cho-ban-vung-cao',
                title: 'Năng lượng xanh cho bản vùng cao',
                description: JSON.stringify({
                    type: 'doc',
                    content: [
                        {
                            type: 'heading',
                            attrs: { level: 2 },
                            content: [{ type: 'text', text: 'Về dự án' }]
                        },
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Dự án "Năng lượng xanh cho bản vùng cao" nhằm mang điện năng lượng mặt trời đến với các hộ gia đình ở vùng cao, nơi chưa có lưới điện quốc gia.'
                                }
                            ]
                        },
                        {
                            type: 'heading',
                            attrs: { level: 2 },
                            content: [{ type: 'text', text: 'Mục tiêu' }]
                        },
                        {
                            type: 'bulletList',
                            content: [
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Lắp đặt 50 hệ thống điện mặt trời cho 50 hộ gia đình' }]
                                        }
                                    ]
                                },
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Cải thiện chất lượng cuộc sống cho 250 người dân vùng cao' }]
                                        }
                                    ]
                                },
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Giảm phát thải CO2, bảo vệ môi trường' }]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'heading',
                            attrs: { level: 2 },
                            content: [{ type: 'text', text: 'Kế hoạch thực hiện' }]
                        },
                        {
                            type: 'orderedList',
                            content: [
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Tháng 1: Khảo sát địa điểm và nhu cầu' }]
                                        }
                                    ]
                                },
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Tháng 2-3: Mua sắm thiết bị và vận chuyển' }]
                                        }
                                    ]
                                },
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Tháng 4-5: Lắp đặt và đào tạo sử dụng' }]
                                        }
                                    ]
                                },
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Tháng 6: Bàn giao và theo dõi' }]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'heading',
                            attrs: { level: 2 },
                            content: [{ type: 'text', text: 'Ngân sách chi tiết' }]
                        },
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    marks: [{ type: 'bold' }],
                                    text: 'Tổng ngân sách: 500.000.000 VNĐ'
                                }
                            ]
                        },
                        {
                            type: 'bulletList',
                            content: [
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Thiết bị năng lượng mặt trời: 350.000.000 VNĐ' }]
                                        }
                                    ]
                                },
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Vận chuyển và lắp đặt: 80.000.000 VNĐ' }]
                                        }
                                    ]
                                },
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Đào tạo và hỗ trợ kỹ thuật: 40.000.000 VNĐ' }]
                                        }
                                    ]
                                },
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Chi phí vận hành dự án: 30.000.000 VNĐ' }]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'heading',
                            attrs: { level: 2 },
                            content: [{ type: 'text', text: 'Tác động dự kiến' }]
                        },
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Dự án sẽ mang lại ánh sáng cho 50 hộ gia đình, giúp trẻ em có điều kiện học tập tốt hơn vào buổi tối, người lớn có thể làm việc và sinh hoạt thuận tiện hơn. Đồng thời, việc sử dụng năng lượng sạch sẽ góp phần bảo vệ môi trường và phát triển bền vững.'
                                }
                            ]
                        }
                    ]
                }),
                longDescription: 'Mang ánh sáng xanh đến với bà con vùng cao, cải thiện chất lượng cuộc sống và bảo vệ môi trường',
                imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200',
                images: [
                    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200',
                    'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1200',
                    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200'
                ],
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                type: 'REWARD',
                category: 'Môi trường',
                tags: ['năng lượng xanh', 'vùng cao', 'điện mặt trời', 'phát triển bền vững'],
                goalAmount: 500000000,
                currentAmount: 0,
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 ngày
                creatorId: creator.id,
                feeRate: 0.05, // 5% cho Creator Pro
            }
        });

        console.log('✅ Đã tạo chiến dịch thành công!');
        console.log(`   ID: ${campaign.id}`);
        console.log(`   Code: ${campaign.campaignCode}`);
        console.log(`   Slug: ${campaign.slug}`);
        console.log(`   Title: ${campaign.title}`);
        console.log(`   Goal: ${campaign.goalAmount.toLocaleString('vi-VN')} VNĐ`);
        console.log(`   Status: ${campaign.status}`);
        console.log(`   End Date: ${campaign.endDate?.toLocaleDateString('vi-VN')}\n`);

        // Tạo rewards cho chiến dịch
        console.log('🎁 Tạo các gói ủng hộ (Rewards)...\n');

        const rewards = await Promise.all([
            prisma.reward.create({
                data: {
                    campaignId: campaign.id,
                    title: 'Gói Cảm ơn',
                    description: 'Nhận lời cảm ơn chân thành từ đội ngũ dự án và cộng đồng bản vùng cao',
                    minAmount: 100000,
                    maxQuantity: null,
                    deliveryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    isActive: true,
                }
            }),
            prisma.reward.create({
                data: {
                    campaignId: campaign.id,
                    title: 'Gói Người ủng hộ',
                    description: 'Nhận ảnh và video về quá trình lắp đặt + Giấy chứng nhận ủng hộ',
                    minAmount: 500000,
                    maxQuantity: 100,
                    deliveryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    isActive: true,
                }
            }),
            prisma.reward.create({
                data: {
                    campaignId: campaign.id,
                    title: 'Gói Đồng hành',
                    description: 'Tất cả phần thưởng trên + Tham gia chuyến đi thực tế đến bản vùng cao + Quà lưu niệm thủ công',
                    minAmount: 2000000,
                    maxQuantity: 20,
                    deliveryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
                    isActive: true,
                }
            }),
            prisma.reward.create({
                data: {
                    campaignId: campaign.id,
                    title: 'Gói Nhà tài trợ',
                    description: 'Tất cả phần thưởng trên + Tên/Logo được ghi nhận trên bảng danh sách nhà tài trợ + Báo cáo chi tiết về tác động dự án',
                    minAmount: 10000000,
                    maxQuantity: 5,
                    deliveryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
                    isActive: true,
                }
            }),
        ]);

        console.log(`✅ Đã tạo ${rewards.length} gói ủng hộ:`);
        rewards.forEach((reward, index) => {
            console.log(`   ${index + 1}. ${reward.title} - ${reward.minAmount.toLocaleString('vi-VN')} VNĐ`);
        });

        // Tạo campaign updates
        console.log('\n📢 Tạo các bài cập nhật chiến dịch...\n');

        const updates = await Promise.all([
            prisma.campaignUpdate.create({
                data: {
                    campaignId: campaign.id,
                    title: 'Khởi động dự án Năng lượng xanh!',
                    content: JSON.stringify({
                        type: 'doc',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: 'Chúng tôi vô cùng vui mừng thông báo dự án "Năng lượng xanh cho bản vùng cao" chính thức được khởi động! Cảm ơn sự quan tâm và ủng hộ của quý vị.'
                                    }
                                ]
                            }
                        ]
                    }),
                    isPinned: true,
                    tags: ['khởi động', 'thông báo'],
                }
            }),
            prisma.campaignUpdate.create({
                data: {
                    campaignId: campaign.id,
                    title: 'Hoàn thành khảo sát địa điểm',
                    content: JSON.stringify({
                        type: 'doc',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: 'Đội ngũ dự án đã hoàn thành khảo sát 50 hộ gia đình tại bản Nà Hẩu, huyện Mường Nhé, tỉnh Điện Biên. Mọi người đều rất mong chờ được có điện sử dụng!'
                                    }
                                ]
                            }
                        ]
                    }),
                    isPinned: false,
                    tags: ['tiến độ', 'khảo sát'],
                }
            }),
        ]);

        console.log(`✅ Đã tạo ${updates.length} bài cập nhật`);

        console.log('\n🎉 HOÀN TẤT! Chiến dịch đã được tạo với đầy đủ thông tin:\n');
        console.log('📋 Tóm tắt:');
        console.log(`   - Chiến dịch: ${campaign.title}`);
        console.log(`   - Mục tiêu: ${campaign.goalAmount.toLocaleString('vi-VN')} VNĐ`);
        console.log(`   - Số gói ủng hộ: ${rewards.length}`);
        console.log(`   - Số bài cập nhật: ${updates.length}`);
        console.log(`   - Trạng thái: ${campaign.status}`);
        console.log(`   - Link: /campaigns/${campaign.slug}\n`);

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
