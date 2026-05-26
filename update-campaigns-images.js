const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🖼️  Bắt đầu cập nhật hình ảnh và nội dung cho campaigns...\n');

    // Lấy tất cả campaigns hiện có
    const campaigns = await prisma.campaign.findMany({
        orderBy: { createdAt: 'asc' }
    });

    if (campaigns.length === 0) {
        console.log('❌ Không có campaign nào để cập nhật!');
        return;
    }

    const updateData = [
        {
            slug: 'ung-dung-tai-chinh',
            imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop',
            longDescription: `<h2>Về Dự Án</h2><p>Chúng tôi đang phát triển một ứng dụng quản lý tài chính cá nhân thông minh, giúp người Việt Nam kiểm soát chi tiêu, lập kế hoạch tiết kiệm và đầu tư hiệu quả.</p><h3>Tính Năng Chính</h3><ul><li>Theo dõi thu chi tự động qua SMS/Email</li><li>Phân tích chi tiêu thông minh với AI</li><li>Lập kế hoạch ngân sách cá nhân</li><li>Nhắc nhở thanh toán hóa đơn</li><li>Báo cáo tài chính trực quan</li></ul><h3>Tại Sao Chúng Tôi Cần Hỗ Trợ</h3><p>Số tiền gây quỹ sẽ được sử dụng để:</p><ul><li>Phát triển tính năng AI phân tích chi tiêu (20 triệu)</li><li>Thiết kế giao diện UX/UI chuyên nghiệp (15 triệu)</li><li>Chi phí server và bảo mật dữ liệu (10 triệu)</li><li>Marketing và quảng bá (5 triệu)</li></ul>`,
        },
        {
            slug: 'sach-lap-trinh',
            imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
            longDescription: `<h2>Giới Thiệu</h2><p>Một cuốn sách lập trình web toàn diện bằng tiếng Việt, từ HTML/CSS cơ bản đến React, Node.js và deployment.</p><h3>Nội Dung Sách</h3><ul><li>Phần 1: HTML, CSS, JavaScript cơ bản (150 trang)</li><li>Phần 2: React và Modern Frontend (200 trang)</li><li>Phần 3: Node.js và Backend API (180 trang)</li><li>Phần 4: Database và Deployment (120 trang)</li></ul><h3>Tác Giả</h3><p>Đội ngũ tác giả gồm các senior developer với hơn 10 năm kinh nghiệm tại các công ty công nghệ hàng đầu.</p>`,
        },
        {
            slug: 'vuon-xanh',
            imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop',
            longDescription: `<h2>Dự Án Vườn Xanh</h2><p>Chúng tôi muốn biến khoảng đất trống 500m² thành vườn rau sạch cộng đồng, nơi mọi người có thể trồng rau, giao lưu và kết nối.</p><h3>Kế Hoạch Thực Hiện</h3><ul><li>Tuần 1-2: San lấp mặt bằng, lắp đặt hệ thống tưới</li><li>Tuần 3-4: Xây dựng luống rau, lối đi</li><li>Tuần 5-6: Trồng cây, tổ chức workshop</li></ul><h3>Lợi Ích</h3><ul><li>Rau sạch cho cộng đồng</li><li>Không gian xanh giảm stress</li><li>Kết nối hàng xóm</li><li>Giáo dục trẻ em về nông nghiệp</li></ul>`,
        },
        {
            slug: 'trien-lam-nghe-thuat',
            imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop',
            longDescription: `<h2>Về Triển Lãm</h2><p>Triển lãm quy tụ 30 nghệ sĩ trẻ tài năng với hơn 100 tác phẩm hội họa, điêu khắc và nghệ thuật số.</p><h3>Thông Tin</h3><ul><li>Thời gian: 3 ngày (Thứ 6-7-8)</li><li>Địa điểm: Trung tâm Văn hóa Quận 1</li><li>Quy mô: 500m² không gian triển lãm</li></ul><h3>Chương Trình</h3><ul><li>Khai mạc với talk show nghệ sĩ</li><li>Workshop vẽ tranh cho trẻ em</li><li>Đấu giá từ thiện các tác phẩm</li><li>Giao lưu nghệ sĩ - khán giả</li></ul>`,
        },
        {
            slug: 'quy-tu-thien',
            imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop',
            longDescription: `<h2>Sứ Mệnh</h2><p>Chúng tôi muốn mang đến cơ hội học tập tốt hơn cho 500 em nhỏ tại các xã vùng cao Hà Giang, Lào Cai.</p><h3>Kế Hoạch Sử Dụng Quỹ</h3><ul><li>Áo ấm mùa đông: 300 bộ (30 triệu)</li><li>Sách vở, dụng cụ học tập (25 triệu)</li><li>Sửa chữa lớp học (30 triệu)</li><li>Học bổng cho học sinh nghèo (15 triệu)</li></ul><h3>Đội Ngũ</h3><p>Chúng tôi là nhóm tình nguyện viên đã có 5 năm hoạt động từ thiện tại vùng cao, với hơn 20 chuyến đi và hỗ trợ hơn 2000 em nhỏ.</p>`,
        },
        {
            slug: 'phim-tai-lieu',
            imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop',
            longDescription: `<h2>Về Phim</h2><p>Bộ phim tài liệu 60 phút về 5 nghề thủ công truyền thống đang dần mai một: đan lát, gốm sứ, dệt thổ cẩm, làm nón lá, và chạm bạc.</p><h3>Nội Dung</h3><ul><li>Phần 1: Hành trình tìm kiếm nghệ nhân</li><li>Phần 2: Quá trình làm nghề từ A-Z</li><li>Phần 3: Thách thức và tương lai nghề</li><li>Phần 4: Truyền nghề cho thế hệ trẻ</li></ul><h3>Đội Ngũ Sản Xuất</h3><p>Đạo diễn từng đoạt giải tại LHP Tài liệu Châu Á, cùng ekip quay phim chuyên nghiệp.</p>`,
        },
        {
            slug: 'khoa-hoc-web',
            imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
            longDescription: `<h2>Chương Trình Học</h2><p>Khóa học 6 tháng với 200+ giờ video, 50+ bài tập thực hành và 5 dự án thực tế.</p><h3>Lộ Trình</h3><ul><li>Tháng 1-2: HTML, CSS, JavaScript</li><li>Tháng 3-4: React, TypeScript, Tailwind</li><li>Tháng 5: Node.js, Express, MongoDB</li><li>Tháng 6: Dự án tốt nghiệp + Portfolio</li></ul><h3>Ưu Đãi Đặc Biệt</h3><ul><li>Mentor 1-1 mỗi tuần</li><li>Code review chi tiết</li><li>Hỗ trợ tìm việc sau khóa học</li><li>Cộng đồng học viên sôi động</li></ul>`,
        },
        {
            slug: 'pin-mat-troi',
            imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
            longDescription: `<h2>Sản Phẩm</h2><p>Pin mặt trời di động công suất 2000W, có thể sạc đầy trong 6 giờ nắng, cung cấp điện cho gia đình 8-10 giờ.</p><h3>Tính Năng</h3><ul><li>Công suất: 2000W (đủ cho tủ lạnh, quạt, TV)</li><li>Dung lượng: 2000Wh</li><li>Thời gian sạc: 6-8 giờ nắng</li><li>Cổng sạc: USB-C, USB-A, AC 220V</li><li>Trọng lượng: 15kg, có bánh xe di chuyển</li></ul><h3>Ứng Dụng</h3><ul><li>Dự phòng khi mất điện</li><li>Cắm trại, picnic</li><li>Tiết kiệm hóa đơn điện</li><li>Thân thiện môi trường</li></ul>`,
        },
        {
            slug: 'app-tieng-anh-ai',
            imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop',
            longDescription: `<h2>Về App</h2><p>Ứng dụng học tiếng Anh với AI teacher, giúp bạn luyện nói, nghe và giao tiếp tự nhiên như người bản xứ.</p><h3>Tính Năng Nổi Bật</h3><ul><li>AI Teacher: Trò chuyện 24/7 với AI</li><li>Phát âm: Chấm điểm và sửa phát âm real-time</li><li>Tình huống: 500+ tình huống giao tiếp thực tế</li><li>Từ vựng: Học từ vựng theo ngữ cảnh</li><li>Game hóa: Tích điểm, thử thách hàng ngày</li></ul><h3>Thành Tích</h3><p>Đã có 50,000+ người dùng beta test với rating 4.8/5 sao. Được đề xuất bởi các giáo viên tiếng Anh hàng đầu.</p>`,
        },
    ];

    let updated = 0;
    for (const data of updateData) {
        const campaign = campaigns.find(c => c.slug === data.slug);
        if (campaign) {
            await prisma.campaign.update({
                where: { id: campaign.id },
                data: {
                    imageUrl: data.imageUrl,
                    longDescription: data.longDescription,
                }
            });
            console.log(`✅ Đã cập nhật: ${campaign.title}`);
            updated++;
        }
    }

    console.log(`\n🎉 Hoàn thành! Đã cập nhật ${updated}/${campaigns.length} campaigns`);
}

main()
    .catch(e => {
        console.error('❌ Lỗi:', e.message);
        console.error(e);
    })
    .finally(() => prisma.$disconnect());
