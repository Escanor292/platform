const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================================
// Hàm tạo nội dung mô tả dạng TipTap JSON
// ============================================================
function buildDescription(sections) {
    const content = [];
    for (const section of sections) {
        if (section.type === 'heading') {
            content.push({
                type: 'heading',
                attrs: { level: section.level || 2 },
                content: [{ type: 'text', text: section.text }]
            });
        } else if (section.type === 'paragraph') {
            content.push({
                type: 'paragraph',
                content: [{ type: 'text', text: section.text }]
            });
        } else if (section.type === 'boldParagraph') {
            content.push({
                type: 'paragraph',
                content: [{ type: 'text', marks: [{ type: 'bold' }], text: section.text }]
            });
        } else if (section.type === 'bulletList') {
            content.push({
                type: 'bulletList',
                content: section.items.map(item => ({
                    type: 'listItem',
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }]
                }))
            });
        } else if (section.type === 'orderedList') {
            content.push({
                type: 'orderedList',
                content: section.items.map(item => ({
                    type: 'listItem',
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }]
                }))
            });
        }
    }
    return JSON.stringify({ type: 'doc', content });
}

// ============================================================
// Dữ liệu các chiến dịch
// ============================================================
const campaignsData = [

    // ================================================================
    // 1. Dự án Giáo dục
    // ================================================================
    {
        campaignCode: `EDU${Date.now()}01`,
        slug: 'thu-vien-sach-cho-tre-vung-sau',
        title: 'Thư viện sách cho trẻ em vùng sâu vùng xa',
        description: buildDescription([
            { type: 'heading', level: 2, text: 'Câu chuyện phía sau dự án' },
            { type: 'paragraph', text: 'Hàng nghìn trẻ em ở vùng sâu vùng xa Tây Nguyên và miền núi phía Bắc đang thiếu thốn sách giáo khoa và sách tham khảo. Nhiều em phải học bằng sách photo cũ nát, thậm chí không có sách để đọc ngoài giờ học.' },
            { type: 'heading', level: 2, text: 'Mục tiêu dự án' },
            { type: 'bulletList', items: [
                'Xây dựng 10 tủ sách mini tại 10 trường tiểu học vùng sâu',
                'Tặng 5.000 cuốn sách bao gồm sách giáo khoa, truyện tranh giáo dục và sách kỹ năng sống',
                'Tổ chức 20 buổi đọc sách và kể chuyện cho các em',
                'Đào tạo 50 giáo viên về phương pháp khuyến đọc'
            ]},
            { type: 'heading', level: 2, text: 'Kế hoạch sử dụng ngân sách' },
            { type: 'bulletList', items: [
                'Mua sách các loại: 120.000.000 VNĐ',
                'Tủ sách và kệ gỗ: 50.000.000 VNĐ',
                'Vận chuyển đến các trường: 30.000.000 VNĐ',
                'Tổ chức các buổi đọc sách: 20.000.000 VNĐ',
                'Chi phí vận hành dự án: 10.000.000 VNĐ'
            ]},
            { type: 'heading', level: 2, text: 'Cam kết minh bạch' },
            { type: 'paragraph', text: 'Chúng tôi cam kết công khai toàn bộ hóa đơn, chứng từ chi tiêu và cập nhật tiến độ hàng tháng qua ảnh và video trực tiếp từ các trường học. Mọi người ủng hộ đều sẽ nhận được báo cáo chi tiết qua email.' }
        ]),
        longDescription: 'Mang tri thức đến với mọi trẻ em Việt Nam, bất kể nơi các em sinh ra và lớn lên',
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80',
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80',
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        type: 'DONATION',
        category: 'Giáo dục',
        tags: ['giáo dục', 'trẻ em', 'sách', 'vùng sâu', 'cộng đồng'],
        goalAmount: 230000000,
        currentAmount: 87500000,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        feeRate: 0.05,
        rewards: [
            {
                title: 'Gói Hạt Giống',
                description: 'Nhận lời cảm ơn đặc biệt và tên được ghi nhận trên bảng vinh danh tại trang web dự án',
                minAmount: 50000,
                maxQuantity: null,
                deliveryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Gói Tri Thức',
                description: 'Nhận ảnh chụp tủ sách với tên/logo của bạn + Giấy chứng nhận ủng hộ + Newsletter hàng tháng',
                minAmount: 200000,
                maxQuantity: 200,
                deliveryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Gói Người Truyền Cảm Hứng',
                description: 'Gói sách tuyển chọn gửi về nhà + Giấy chứng nhận + Video cảm ơn từ các em học sinh',
                minAmount: 500000,
                maxQuantity: 100,
                deliveryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Gói Nhà Tài Trợ Vàng',
                description: 'Tất cả phần thưởng trên + 1 chuyến tham quan trực tiếp đến trường học + Plaque tên tài trợ trên tủ sách',
                minAmount: 5000000,
                maxQuantity: 10,
                deliveryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
            },
        ],
        updates: [
            {
                title: '🎉 Dự án chính thức khởi động - Cảm ơn 500 người ủng hộ đầu tiên!',
                content: buildDescription([
                    { type: 'paragraph', text: 'Sau 15 ngày ra mắt, chúng tôi đã nhận được sự ủng hộ nhiệt tình từ 500 người đóng góp với tổng số tiền hơn 87 triệu đồng. Đây là động lực to lớn để đội ngũ chúng tôi tiếp tục nỗ lực!' },
                    { type: 'paragraph', text: 'Chúng tôi đã bắt đầu liên hệ với các nhà xuất bản để đặt hàng sách với giá ưu đãi. Danh sách 10 trường học đã được xác nhận và chúng tôi đang lên kế hoạch vận chuyển.' }
                ]),
                isPinned: true,
                tags: ['cột mốc', 'cảm ơn'],
            },
            {
                title: '📚 Danh sách sách đã được chọn lọc',
                content: buildDescription([
                    { type: 'paragraph', text: 'Sau nhiều cuộc họp với các chuyên gia giáo dục và giáo viên tại các trường, chúng tôi đã hoàn thiện danh sách 5.000 cuốn sách sẽ được tặng.' },
                    { type: 'bulletList', items: ['1.500 sách giáo khoa bổ trợ lớp 1-5', '2.000 sách truyện tranh giáo dục', '1.000 sách kỹ năng sống cho trẻ em', '500 sách tham khảo cho giáo viên'] }
                ]),
                isPinned: false,
                tags: ['tiến độ', 'kế hoạch'],
            },
        ]
    },

    // ================================================================
    // 2. Dự án Y tế
    // ================================================================
    {
        campaignCode: `MED${Date.now()}02`,
        slug: 'xe-cuu-thuong-cho-xa-ngheo',
        title: 'Xe cứu thương cho 5 xã nghèo tỉnh Hà Giang',
        description: buildDescription([
            { type: 'heading', level: 2, text: 'Tình trạng khẩn cấp y tế vùng cao' },
            { type: 'paragraph', text: '5 xã vùng cao tỉnh Hà Giang với dân số hơn 15.000 người đang không có xe cứu thương. Khi có người bệnh cần cấp cứu, họ phải đi bộ hoặc dùng xe máy hàng chục km đường núi để đến trạm y tế xã gần nhất. Nhiều ca tử vong đau lòng đã xảy ra do không được cấp cứu kịp thời.' },
            { type: 'heading', level: 2, text: 'Giải pháp chúng tôi đề xuất' },
            { type: 'bulletList', items: [
                'Mua 1 xe cứu thương đa năng 7 chỗ phù hợp đường núi',
                'Trang bị đầy đủ thiết bị y tế khẩn cấp: máy sốc tim, bình oxy, cáng cứu thương',
                'Đào tạo 10 lái xe và 20 nhân viên y tế về sơ cấp cứu',
                'Vận hành miễn phí trong 2 năm đầu'
            ]},
            { type: 'heading', level: 2, text: 'Phân bổ ngân sách' },
            { type: 'bulletList', items: [
                'Xe cứu thương: 600.000.000 VNĐ',
                'Thiết bị y tế: 150.000.000 VNĐ',
                'Nhiên liệu và bảo dưỡng 2 năm: 80.000.000 VNĐ',
                'Đào tạo nhân sự: 30.000.000 VNĐ',
                'Chi phí đăng ký và thủ tục: 20.000.000 VNĐ',
                'Quỹ dự phòng: 20.000.000 VNĐ'
            ]},
            { type: 'heading', level: 2, text: 'Đối tác thực hiện' },
            { type: 'paragraph', text: 'Dự án được phối hợp thực hiện bởi Sở Y tế tỉnh Hà Giang, Hội Chữ thập đỏ Việt Nam và tổ chức phi lợi nhuận Vì Sức Khỏe Cộng Đồng. Tất cả tài sản sau khi mua sắm sẽ được bàn giao cho UBND xã quản lý.' }
        ]),
        longDescription: 'Không ai nên chết vì không có phương tiện cứu thương khi đang trong hoàn cảnh nguy kịch',
        imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&q=80',
            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
            'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80',
            'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200&q=80'
        ],
        videoUrl: null,
        type: 'DONATION',
        category: 'Y tế',
        tags: ['y tế', 'cứu thương', 'vùng cao', 'Hà Giang', 'khẩn cấp'],
        goalAmount: 900000000,
        currentAmount: 345000000,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        feeRate: 0.03,
        rewards: [
            {
                title: 'Người Ủng Hộ',
                description: 'Tên được khắc trên bảng vinh danh trong xe cứu thương + Giấy chứng nhận điện tử',
                minAmount: 100000,
                maxQuantity: null,
                deliveryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Đồng Hành Cứu Người',
                description: 'Tất cả trên + Áo thun dự án + Video ký tên xe cứu thương',
                minAmount: 500000,
                maxQuantity: 150,
                deliveryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Nhà Bảo Trợ Y Tế',
                description: 'Logo/tên trên thân xe cứu thương + Chứng nhận Nhà Bảo Trợ chính thức + Báo cáo hoạt động hàng quý',
                minAmount: 10000000,
                maxQuantity: 5,
                deliveryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
            },
        ],
        updates: [
            {
                title: '🚑 38% mục tiêu đã đạt được - Chúng tôi đang trên đà!',
                content: buildDescription([
                    { type: 'paragraph', text: 'Sau 30 ngày vận động, chúng tôi đã huy động được 345 triệu đồng, đạt 38% mục tiêu. Đây là kết quả đáng kinh ngạc nhờ sự lan tỏa mạnh mẽ của cộng đồng!' },
                    { type: 'paragraph', text: 'Chúng tôi đang đàm phán với đại lý xe Toyota và Ford để chọn mẫu xe phù hợp nhất cho địa hình vùng núi Hà Giang. Dự kiến tháng tới sẽ có quyết định chính thức.' }
                ]),
                isPinned: true,
                tags: ['tiến độ', 'cập nhật'],
            }
        ]
    },

    // ================================================================
    // 3. Dự án Môi trường
    // ================================================================
    {
        campaignCode: `ENV${Date.now()}03`,
        slug: 'trong-1-trieu-cay-xanh-viet-nam-2025',
        title: 'Trồng 1 triệu cây xanh - Hành trình phủ xanh Việt Nam 2025',
        description: buildDescription([
            { type: 'heading', level: 2, text: 'Vì sao Việt Nam cần trồng thêm cây?' },
            { type: 'paragraph', text: 'Diện tích rừng Việt Nam đang suy giảm đáng báo động. Biến đổi khí hậu, lũ lụt và hạn hán ngày càng khốc liệt hơn. Trong 10 năm qua, gần 500.000 ha rừng đã bị mất do khai thác và chuyển đổi mục đích sử dụng đất.' },
            { type: 'heading', level: 2, text: 'Kế hoạch trồng cây chi tiết' },
            { type: 'orderedList', items: [
                'Tháng 1-3: Chuẩn bị 1.000.000 cây giống tại 20 vườn ươm',
                'Tháng 4-6: Trồng 500.000 cây tại các tỉnh miền Trung (Quảng Trị, Thừa Thiên Huế)',
                'Tháng 7-9: Trồng 300.000 cây tại Tây Nguyên (Gia Lai, Đắk Lắk)',
                'Tháng 10-12: Trồng 200.000 cây tại miền núi phía Bắc (Sơn La, Điện Biên)',
                'Năm 2: Chăm sóc và theo dõi tỷ lệ sống sót của cây'
            ]},
            { type: 'heading', level: 2, text: 'Các loại cây được trồng' },
            { type: 'bulletList', items: [
                '300.000 cây bản địa (lim, sến, táu, giổi)',
                '400.000 cây phòng hộ (keo, bạch đàn xanh)',
                '200.000 cây ăn quả cho cộng đồng địa phương',
                '100.000 cây đô thị và cây bóng mát'
            ]},
            { type: 'heading', level: 2, text: 'Công nghệ theo dõi' },
            { type: 'paragraph', text: 'Mỗi cây được gắn chip QR code. Người ủng hộ có thể theo dõi cây "của mình" thông qua ứng dụng di động, bao gồm vị trí GPS, ảnh hiện trạng và thông số tăng trưởng cập nhật mỗi quý.' }
        ]),
        longDescription: 'Mỗi cây xanh là một bước nhỏ để bảo vệ Trái Đất và tương lai của con cháu chúng ta',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80',
            'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
            'https://images.unsplash.com/photo-1518331483807-f6adb0e1ad23?w=1200&q=80',
            'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=80',
            'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1200&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'REWARD',
        category: 'Môi trường',
        tags: ['môi trường', 'trồng cây', 'khí hậu', 'rừng', 'bền vững'],
        goalAmount: 2000000000,
        currentAmount: 1250000000,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        feeRate: 0.05,
        rewards: [
            {
                title: 'Trồng 1 Cây',
                description: 'Bạn sẽ sở hữu 1 cây xanh được đặt tên theo bạn. Nhận mã QR để theo dõi cây của mình qua app',
                minAmount: 50000,
                maxQuantity: 1000000,
                deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Trồng 10 Cây - Gia Đình Xanh',
                description: '10 cây mang tên gia đình bạn + Chứng chỉ Gia Đình Xanh + Bộ ảnh cây được in và gửi về nhà',
                minAmount: 400000,
                maxQuantity: 50000,
                deliveryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Rừng Nhỏ Của Tôi',
                description: '100 cây trong một khu vực liên tục mang tên bạn + Bản đồ số khu rừng + Chứng nhận chủ rừng',
                minAmount: 3000000,
                maxQuantity: 5000,
                deliveryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Nhà Tài Trợ Doanh Nghiệp Xanh',
                description: '1.000 cây, biển tên doanh nghiệp tại khu rừng, báo cáo ESG hàng năm, chứng chỉ carbon offset',
                minAmount: 50000000,
                maxQuantity: 100,
                deliveryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            },
        ],
        updates: [
            {
                title: '🌳 62% mục tiêu - Cảm ơn 25.000 người ủng hộ!',
                content: buildDescription([
                    { type: 'paragraph', text: 'Chúng tôi đã vượt mốc 25.000 người ủng hộ và đạt 62% mục tiêu tài chính! Với 1.25 tỷ đồng, chúng tôi đã có thể bắt đầu giai đoạn ươm cây.' },
                    { type: 'paragraph', text: '500.000 hạt giống đã được gieo trồng tại 15 vườn ươm trên toàn quốc. Tỷ lệ nảy mầm đạt 85%, vượt kỳ vọng!' }
                ]),
                isPinned: true,
                tags: ['cột mốc', 'tiến độ'],
            },
            {
                title: '🌱 Vườn ươm đầu tiên đã sẵn sàng',
                content: buildDescription([
                    { type: 'paragraph', text: 'Vườn ươm tại Quảng Trị với 100.000 cây giống đã sẵn sàng cho đợt trồng đầu tiên vào tháng tới. Đây là bước tiến quan trọng của dự án!' }
                ]),
                isPinned: false,
                tags: ['tiến độ', 'vườn ươm'],
            },
        ]
    },

    // ================================================================
    // 4. Dự án Công nghệ / Khởi nghiệp
    // ================================================================
    {
        campaignCode: `TECH${Date.now()}04`,
        slug: 'app-hoc-tieng-anh-ai-cho-hoc-sinh-nong-thon',
        title: 'Ứng dụng học tiếng Anh bằng AI cho học sinh nông thôn',
        description: buildDescription([
            { type: 'heading', level: 2, text: 'Khoảng cách giáo dục thành thị - nông thôn' },
            { type: 'paragraph', text: 'Học sinh ở các vùng nông thôn và ngoại ô thiếu cơ hội tiếp cận giáo viên tiếng Anh chất lượng. Một buổi học với giáo viên nước ngoài có thể tốn 300.000-500.000 VNĐ/giờ - quá đắt đỏ với nhiều gia đình.' },
            { type: 'heading', level: 2, text: 'Giải pháp của chúng tôi: EduAI English' },
            { type: 'paragraph', text: 'Chúng tôi đang phát triển ứng dụng EduAI English - sử dụng AI để tạo ra trải nghiệm học tiếng Anh cá nhân hóa, hiệu quả và hoàn toàn MIỄN PHÍ cho học sinh nông thôn.' },
            { type: 'heading', level: 2, text: 'Tính năng nổi bật' },
            { type: 'bulletList', items: [
                'AI Tutor 24/7: Giáo viên AI luôn sẵn sàng luyện tập hội thoại',
                'Nhận diện giọng nói: Đánh giá phát âm và đưa ra gợi ý cải thiện',
                'Học theo chủ đề: Từ vựng theo 50+ chủ đề thực tế',
                'Gamification: Hệ thống điểm thưởng và bảng xếp hạng khuyến khích học',
                'Offline mode: Học được ngay cả khi không có internet'
            ]},
            { type: 'heading', level: 2, text: 'Kế hoạch phát triển' },
            { type: 'orderedList', items: [
                'Tháng 1-3: Phát triển core features và train AI model',
                'Tháng 4: Beta test với 1.000 học sinh tại 5 tỉnh',
                'Tháng 5: Cải thiện dựa trên phản hồi',
                'Tháng 6: Ra mắt chính thức trên App Store và Google Play',
                'Năm 2: Mở rộng sang 10 tỉnh thành'
            ]},
            { type: 'heading', level: 2, text: 'Đội ngũ phát triển' },
            { type: 'paragraph', text: 'Đội ngũ gồm 8 kỹ sư phần mềm từ các công ty công nghệ hàng đầu, 3 chuyên gia giáo dục ngôn ngữ và 2 nhà khoa học AI. Tất cả đều có chung mong muốn dùng công nghệ để thu hẹp khoảng cách giáo dục.' }
        ]),
        longDescription: 'Dùng sức mạnh của AI để mang cơ hội học tiếng Anh chất lượng đến với mọi học sinh Việt Nam',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80',
            'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80',
            'https://images.unsplash.com/photo-1587691592099-24045742c181?w=1200&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'REWARD',
        category: 'Công nghệ',
        tags: ['AI', 'giáo dục', 'tiếng Anh', 'công nghệ', 'khởi nghiệp', 'app'],
        goalAmount: 800000000,
        currentAmount: 156000000,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        feeRate: 0.08,
        rewards: [
            {
                title: 'Early Supporter',
                description: 'Tài khoản Premium miễn phí 3 tháng khi app ra mắt + Tên trong danh sách Early Supporters',
                minAmount: 100000,
                maxQuantity: 500,
                deliveryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Founder Member',
                description: 'Tài khoản Premium VĨNH VIỄN + Badge đặc biệt Founder + Quyền truy cập beta sớm nhất',
                minAmount: 500000,
                maxQuantity: 100,
                deliveryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Nhà Bảo Trợ Lớp Học',
                description: 'Tài trợ 30 tài khoản Premium cho học sinh nghèo + Logo trên app + Báo cáo tác động hàng năm',
                minAmount: 3000000,
                maxQuantity: 20,
                deliveryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
            },
        ],
        updates: [
            {
                title: '🚀 Demo đầu tiên của EduAI đã hoàn thành!',
                content: buildDescription([
                    { type: 'paragraph', text: 'Sau 10 ngày, chúng tôi đã có demo đầu tiên và nhận được phản hồi rất tích cực! Đặc biệt tính năng nhận diện giọng nói hoạt động chính xác đến 91%.' },
                    { type: 'paragraph', text: 'Đội ngũ đang làm việc không nghỉ để hoàn thiện UI/UX trước khi beta test vào tháng tới. Cảm ơn 1.560 người đã tin tưởng ủng hộ chúng tôi!' }
                ]),
                isPinned: true,
                tags: ['demo', 'tiến độ'],
            }
        ]
    },

    // ================================================================
    // 5. Dự án Văn hóa / Nghệ thuật
    // ================================================================
    {
        campaignCode: `ART${Date.now()}05`,
        slug: 'album-nhac-dan-toc-viet-hien-dai',
        title: 'Album nhạc dân tộc Việt Nam hiện đại - Hồn Việt 2025',
        description: buildDescription([
            { type: 'heading', level: 2, text: 'Về dự án Hồn Việt 2025' },
            { type: 'paragraph', text: 'Hồn Việt 2025 là dự án âm nhạc tham vọng nhất từ trước đến nay của chúng tôi: thu âm 12 bản nhạc dân tộc truyền thống được phối khí hiện đại, kết hợp nhạc cụ dân tộc (đàn bầu, đàn tranh, sáo trúc) với âm thanh điện tử đương đại.' },
            { type: 'heading', level: 2, text: 'Danh sách nghệ sĩ tham gia' },
            { type: 'bulletList', items: [
                'NSND Hương Lan - Đàn bầu',
                'Nghệ sĩ trẻ Minh Tú - Đàn tranh và Guitar điện',
                'DJ/Producer Sun Lee - Âm nhạc điện tử',
                'Nghệ sĩ Thanh Hoa - Sáo trúc và Kèn',
                '20 nhạc sĩ của Dàn nhạc Giao hưởng Quốc gia'
            ]},
            { type: 'heading', level: 2, text: 'Danh sách các bản nhạc' },
            { type: 'bulletList', items: [
                '"Hò khoan Lệ Thủy" phiên bản Electronic',
                '"Trống cơm" phiên bản Jazz Fusion',
                '"Lý ngựa ô" phiên bản R&B',
                '"Quan họ Bắc Ninh" phiên bản Neo-Soul',
                'Và 8 bản nhạc khác...'
            ]},
            { type: 'heading', level: 2, text: 'Phân bổ kinh phí' },
            { type: 'bulletList', items: [
                'Studio recording và mix/master: 200.000.000 VNĐ',
                'Thù lao nghệ sĩ: 150.000.000 VNĐ',
                'Dàn nhạc đệm: 80.000.000 VNĐ',
                'MV cho 3 bản nhạc chính: 100.000.000 VNĐ',
                'Marketing và phát hành: 70.000.000 VNĐ'
            ]}
        ]),
        longDescription: 'Khi âm nhạc truyền thống gặp nhịp đập hiện đại - tạo nên bản sắc Việt Nam mới cho thế giới',
        imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80',
            'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1200&q=80',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
            'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'REWARD',
        category: 'Nghệ thuật',
        tags: ['âm nhạc', 'văn hóa', 'dân tộc', 'nghệ thuật', 'album'],
        goalAmount: 600000000,
        currentAmount: 600000000,
        status: 'SUCCESS',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        feeRate: 0.08,
        rewards: [
            {
                title: 'Nghe Nhạc Sớm',
                description: 'File nhạc FLAC lossless của cả album khi phát hành + Tên trong phần credits album',
                minAmount: 100000,
                maxQuantity: null,
                deliveryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Fan Package',
                description: 'CD + DVD making-of + Poster ký tên + File nhạc FLAC + Tên trong credits',
                minAmount: 300000,
                maxQuantity: 500,
                deliveryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'VIP Concert Pass',
                description: 'Tất cả trên + 2 vé VIP đêm nhạc ra mắt album + Gặp gỡ các nghệ sĩ + Tiệc chiêu đãi sau show',
                minAmount: 2000000,
                maxQuantity: 50,
                deliveryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Producer Circle',
                description: 'Tên nhà sản xuất trong album + Tất cả phần thưởng VIP + Tham gia 1 buổi thu âm',
                minAmount: 20000000,
                maxQuantity: 5,
                deliveryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            },
        ],
        updates: [
            {
                title: '🎉 THÀNH CÔNG! Album đã được thu âm hoàn chỉnh!',
                content: buildDescription([
                    { type: 'paragraph', text: 'Chúng tôi vô cùng vui mừng thông báo: Hồn Việt 2025 đã đạt 100% mục tiêu tài chính và album đã hoàn thành ghi âm tại studio!' },
                    { type: 'paragraph', text: 'Cảm ơn 4.200 người ủng hộ đã tin tưởng vào dự án này. Album sẽ được phát hành chính thức vào tháng tới trên Spotify, Apple Music và TikTok.' }
                ]),
                isPinned: true,
                tags: ['thành công', 'hoàn thành'],
            },
            {
                title: '🎵 Preview 3 bản nhạc đầu tiên - Nghe ngay!',
                content: buildDescription([
                    { type: 'paragraph', text: 'Để cảm ơn tất cả người ủng hộ, chúng tôi chia sẻ preview 3 bản nhạc đầu tiên: "Hò khoan Lệ Thủy Electronic", "Trống cơm Jazz" và "Quan họ Neo-Soul".' },
                    { type: 'paragraph', text: 'Phản hồi từ cộng đồng rất tuyệt vời! Hơn 10.000 lượt nghe chỉ trong 24 giờ đầu.' }
                ]),
                isPinned: false,
                tags: ['preview', 'nhạc'],
            },
        ]
    },

    // ================================================================
    // 6. Dự án Nông nghiệp
    // ================================================================
    {
        campaignCode: `AGR${Date.now()}06`,
        slug: 'hop-tac-xa-nong-nghiep-huu-co-mekong',
        title: 'Hợp tác xã nông nghiệp hữu cơ đồng bằng Mekong',
        description: buildDescription([
            { type: 'heading', level: 2, text: 'Thực trạng nông nghiệp đồng bằng sông Cửu Long' },
            { type: 'paragraph', text: 'Nông dân vùng đồng bằng sông Cửu Long đang đối mặt với nhiều thách thức: giá lúa thấp, chi phí thuốc trừ sâu cao, ô nhiễm đất và nước ngày càng nghiêm trọng. Nhiều hộ gia đình thu nhập chỉ đạt 3-5 triệu đồng/tháng dù làm việc quần quật suốt năm.' },
            { type: 'heading', level: 2, text: 'Mô hình hợp tác xã hữu cơ' },
            { type: 'paragraph', text: 'Chúng tôi sẽ thành lập hợp tác xã nông nghiệp hữu cơ với 50 hộ nông dân, canh tác trên 200ha đất lúa. Mô hình bao gồm:' },
            { type: 'bulletList', items: [
                'Chuyển đổi 200ha ruộng lúa sang canh tác hữu cơ',
                'Xây dựng nhà máy chế biến và đóng gói đạt chuẩn xuất khẩu',
                'Kết nối trực tiếp với siêu thị và nhà hàng organic',
                'Xuất khẩu sang thị trường Nhật Bản và Hàn Quốc',
                'Phát triển du lịch nông nghiệp - agro-tourism'
            ]},
            { type: 'heading', level: 2, text: 'Thu nhập dự kiến cho nông dân' },
            { type: 'paragraph', text: 'Theo nghiên cứu, nông dân hữu cơ có thể đạt thu nhập gấp 2-3 lần so với canh tác thông thường. Chúng tôi cam kết thu nhập tối thiểu 15 triệu đồng/tháng cho mỗi hộ tham gia sau 2 năm.' },
            { type: 'heading', level: 2, text: 'Đối tác chiến lược' },
            { type: 'bulletList', items: [
                'Đại học Cần Thơ - Hỗ trợ kỹ thuật nông nghiệp',
                'Sở Nông nghiệp tỉnh Đồng Tháp - Cấp phép và hỗ trợ chính sách',
                'Tập đoàn Lộc Trời - Phân phối trong nước',
                'Công ty xuất khẩu Omic (Nhật Bản) - Xuất khẩu'
            ]}
        ]),
        longDescription: 'Nâng cao thu nhập cho nông dân bằng cách tạo ra nông sản sạch, an toàn cho người tiêu dùng và có giá trị cao hơn',
        imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
        images: [
            'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80',
            'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80',
            'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=1200&q=80'
        ],
        videoUrl: null,
        type: 'REWARD',
        category: 'Nông nghiệp',
        tags: ['nông nghiệp', 'hữu cơ', 'Mekong', 'nông dân', 'xuất khẩu'],
        goalAmount: 3000000000,
        currentAmount: 450000000,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
        feeRate: 0.05,
        rewards: [
            {
                title: 'Gói Hạt Lúa',
                description: 'Nhận 5kg gạo hữu cơ đặc sản Mekong chất lượng cao giao tận nhà',
                minAmount: 200000,
                maxQuantity: 1000,
                deliveryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Gói Gia Đình Sạch',
                description: '20kg gạo hữu cơ + Combo rau củ hữu cơ 3 tháng + Giấy chứng nhận Người Hỗ Trợ Nông Dân',
                minAmount: 500000,
                maxQuantity: 500,
                deliveryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Cổ Phần Đồng Ruộng',
                description: 'Sở hữu 0.1ha ruộng hữu cơ - nhận toàn bộ sản lượng thu hoạch mỗi vụ + Thăm ruộng trực tiếp',
                minAmount: 5000000,
                maxQuantity: 200,
                deliveryDate: new Date(Date.now() + 360 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Nhà Đầu Tư Chiến Lược',
                description: 'Cổ phần trong hợp tác xã, tham gia hội đồng quản trị, báo cáo tài chính hàng quý',
                minAmount: 100000000,
                maxQuantity: 10,
                deliveryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        ],
        updates: [
            {
                title: '🌾 Đã hoàn tất thủ tục pháp lý - Hợp tác xã chính thức được thành lập!',
                content: buildDescription([
                    { type: 'paragraph', text: 'Tin vui! Hợp tác xã Nông nghiệp Hữu cơ Mekong đã được Sở Kế hoạch và Đầu tư tỉnh Đồng Tháp cấp phép chính thức. 50 hộ nông dân đầu tiên đã ký kết tham gia.' },
                    { type: 'paragraph', text: 'Chúng tôi đang bắt đầu chuyển đổi 50ha đầu tiên sang canh tác hữu cơ. Dự kiến vụ đầu tiên sẽ thu hoạch vào tháng 11/2025.' }
                ]),
                isPinned: true,
                tags: ['pháp lý', 'thành lập', 'tiến độ'],
            }
        ]
    },

];

// ============================================================
// Hàm tạo dự án
// ============================================================
async function createCampaigns() {
    try {
        console.log('\n🚀 BẮT ĐẦU TẠO DỰ ÁN CHO test3@gmail.com\n');
        console.log('='.repeat(60));

        // Tìm user test3@gmail.com
        const creator = await prisma.user.findUnique({
            where: { email: 'test3@gmail.com' }
        });

        if (!creator) {
            console.log('❌ Không tìm thấy user test3@gmail.com');
            console.log('   Vui lòng tạo tài khoản trước.');
            return;
        }

        console.log(`✅ Tìm thấy Creator: ${creator.name} (${creator.email})`);
        console.log(`   ID: ${creator.id}`);
        console.log(`   Role: ${creator.role}, Status: ${creator.status}\n`);

        // Kiểm tra và cập nhật role nếu cần
        if (creator.role !== 'CREATOR' && creator.role !== 'ADMIN') {
            await prisma.user.update({
                where: { id: creator.id },
                data: { role: 'CREATOR' }
            });
            console.log('✅ Đã cập nhật role thành CREATOR\n');
        }

        const createdCampaigns = [];

        for (let i = 0; i < campaignsData.length; i++) {
            const data = campaignsData[i];
            const { rewards, updates, ...campaignData } = data;

            console.log(`\n[${i + 1}/${campaignsData.length}] 📦 Tạo dự án: "${campaignData.title}"`);
            console.log('─'.repeat(50));

            try {
                // Kiểm tra slug đã tồn tại chưa
                const existing = await prisma.campaign.findUnique({
                    where: { slug: campaignData.slug }
                });

                if (existing) {
                    console.log(`   ⚠️  Slug "${campaignData.slug}" đã tồn tại, bỏ qua...`);
                    continue;
                }

                // Tạo campaign
                const campaign = await prisma.campaign.create({
                    data: {
                        ...campaignData,
                        creatorId: creator.id,
                    }
                });

                console.log(`   ✅ Campaign tạo thành công - ID: ${campaign.id}`);
                console.log(`   📊 Mục tiêu: ${Number(campaign.goalAmount).toLocaleString('vi-VN')} VNĐ`);
                console.log(`   💰 Hiện có: ${Number(campaign.currentAmount).toLocaleString('vi-VN')} VNĐ`);
                console.log(`   📅 Kết thúc: ${campaign.endDate?.toLocaleDateString('vi-VN')}`);
                console.log(`   🏷️  Trạng thái: ${campaign.status}`);

                // Tạo rewards
                if (rewards && rewards.length > 0) {
                    const createdRewards = await Promise.all(
                        rewards.map(reward => prisma.reward.create({
                            data: { ...reward, campaignId: campaign.id }
                        }))
                    );
                    console.log(`   🎁 Đã tạo ${createdRewards.length} gói phần thưởng:`);
                    createdRewards.forEach(r => {
                        console.log(`      - ${r.title}: ${Number(r.minAmount).toLocaleString('vi-VN')} VNĐ`);
                    });
                }

                // Tạo updates
                if (updates && updates.length > 0) {
                    const createdUpdates = await Promise.all(
                        updates.map(update => prisma.campaignUpdate.create({
                            data: { ...update, campaignId: campaign.id }
                        }))
                    );
                    console.log(`   📢 Đã tạo ${createdUpdates.length} bài cập nhật`);
                }

                createdCampaigns.push(campaign);

            } catch (err) {
                console.log(`   ❌ Lỗi tạo campaign "${campaignData.title}":`, err.message);
            }
        }

        // Tóm tắt kết quả
        console.log('\n' + '='.repeat(60));
        console.log('🎉 HOÀN TẤT! KẾT QUẢ TẠO DỰ ÁN');
        console.log('='.repeat(60));
        console.log(`✅ Đã tạo thành công: ${createdCampaigns.length}/${campaignsData.length} dự án\n`);

        console.log('📋 DANH SÁCH DỰ ÁN ĐÃ TẠO:');
        createdCampaigns.forEach((c, idx) => {
            console.log(`\n${idx + 1}. ${c.title}`);
            console.log(`   🔗 Link: /campaigns/${c.slug}`);
            console.log(`   💵 Mục tiêu: ${Number(c.goalAmount).toLocaleString('vi-VN')} VNĐ`);
            console.log(`   📈 Tiến độ: ${Number(c.currentAmount).toLocaleString('vi-VN')} VNĐ (${Math.round(Number(c.currentAmount) / Number(c.goalAmount) * 100)}%)`);
            console.log(`   🏷️  Danh mục: ${c.category} | Loại: ${c.type} | Trạng thái: ${c.status}`);
        });

        console.log('\n🌐 Truy cập: http://localhost:3000 để xem các dự án');
        console.log('👤 Đăng nhập: test3@gmail.com để quản lý dự án\n');

    } catch (error) {
        console.error('❌ Lỗi chính:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createCampaigns();
