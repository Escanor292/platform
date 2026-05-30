const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const userId = 'cmp3xn95c0003ap5u5cb15ibc';
    
    console.log(`\n🔄 ĐANG CẬP NHẬT THÔNG TIN MẠNG XÃ HỘI CHO USER: ${userId}\n`);

    const socialLinks = [
        { platform: 'facebook', url: 'https://facebook.com/tute.fund.example', icon: 'facebook' },
        { platform: 'twitter', url: 'https://twitter.com/tute_fund', icon: 'twitter' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/tute-fund', icon: 'linkedin' },
        { platform: 'youtube', url: 'https://youtube.com/c/TuteFundOfficial', icon: 'youtube' },
        { platform: 'instagram', url: 'https://instagram.com/tute.fund', icon: 'instagram' }
    ];

    const website = 'https://tutefund.vn';
    const bio = 'Chào mừng bạn đến với hồ sơ của tôi. Tôi là một nhà sáng tạo đam mê các dự án cộng đồng và phát triển bền vững tại Việt Nam.';

    try {
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user) {
            console.error(`❌ Không tìm thấy người dùng với ID: ${userId}`);
            return;
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                socialLinks: socialLinks,
                website: website,
                bio: bio,
                location: 'Hồ Chí Minh, Việt Nam',
                displayName: user.name || 'Nhà sáng tạo Tử Tế'
            }
        });

        console.log('✅ CẬP NHẬT THÀNH CÔNG!');
        console.log('-------------------------');
        console.log(`- Tên hiển thị: ${updatedUser.displayName}`);
        console.log(`- Website: ${updatedUser.website}`);
        console.log(`- Bio: ${updatedUser.bio}`);
        console.log(`- Mạng xã hội: ${updatedUser.socialLinks.length} liên kết`);
        console.log('-------------------------');

    } catch (error) {
        console.error('❌ Lỗi khi cập nhật:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
