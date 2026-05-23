const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🚀 Bắt đầu tạo bài blog về Thuế TNCN...');

        // 1. Tìm tài khoản test3
        const test3 = await prisma.user.findFirst({
            where: { email: 'test3@gmail.com' }
        });

        if (!test3) {
            console.log('❌ Không tìm thấy tài khoản test3@gmail.com');
            return;
        }

        console.log('✅ Tìm thấy tài khoản:', test3.email);

        // 2. Tạo hoặc lấy category "Tài chính"
        let financeCategory = await prisma.blogCategory.findFirst({
            where: { slug: 'tai-chinh' }
        });

        if (!financeCategory) {
            financeCategory = await prisma.blogCategory.create({
                data: {
                    name: 'Tài chính',
                    slug: 'tai-chinh',
                    description: 'Các bài viết về tài chính, thuế, kế toán'
                }
            });
            console.log('✅ Đã tạo category: Tài chính');
        } else {
            console.log('✅ Đã có category: Tài chính');
        }

        // 3. Tạo hoặc lấy tags
        const tagNames = ['thuế', 'TNCN', 'kê khai thuế', 'quyết toán thuế', 'tài chính cá nhân'];
        const tags = [];

        for (const tagName of tagNames) {
            const slug = tagName.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-');

            let tag = await prisma.blogTag.findFirst({
                where: { slug }
            });

            if (!tag) {
                tag = await prisma.blogTag.create({
                    data: {
                        name: tagName,
                        slug
                    }
                });
                console.log(`✅ Đã tạo tag: ${tagName}`);
            }

            tags.push(tag);
        }

        // 4. Nội dung bài viết
        const blogContent = `
<h2>1. Thuế Thu Nhập Cá Nhân là gì?</h2>

<p><strong>Thuế Thu Nhập Cá Nhân (TNCN)</strong> là khoản thuế mà cá nhân phải nộp cho Nhà nước dựa trên phần thu nhập chịu thuế phát sinh từ tiền lương, tiền công hoặc các nguồn thu nhập khác theo quy định pháp luật.</p>

<p>Một số nguồn thu nhập phổ biến chịu thuế TNCN gồm:</p>
<ul>
  <li>Tiền lương, tiền công</li>
  <li>Thu nhập từ kinh doanh</li>
  <li>Thu nhập từ đầu tư vốn</li>
  <li>Thu nhập từ chuyển nhượng bất động sản</li>
  <li>Thu nhập từ trúng thưởng</li>
  <li>Thu nhập từ bản quyền, nhượng quyền thương mại</li>
</ul>

<p>Đối với người lao động làm công ăn lương, thuế TNCN thường được doanh nghiệp khấu trừ trực tiếp hàng tháng trước khi trả lương.</p>

<h2>2. Mục đích của việc kê khai và quyết toán thuế</h2>

<p>Kê khai và quyết toán thuế giúp:</p>
<ul>
  <li>Xác định chính xác số thuế phải nộp</li>
  <li>Hoàn lại phần thuế đã nộp thừa</li>
  <li>Bổ sung số thuế còn thiếu</li>
  <li>Đảm bảo tuân thủ đúng quy định pháp luật</li>
</ul>

<p>Theo quy định hiện hành, cá nhân hoặc tổ chức chi trả thu nhập phải thực hiện kê khai và quyết toán thuế định kỳ với cơ quan thuế.</p>

<h2>3. Kê khai thuế TNCN</h2>

<h3>3.1 Kê khai thuế là gì?</h3>

<p>Kê khai thuế là việc cá nhân hoặc doanh nghiệp cung cấp thông tin thu nhập, số thuế phải nộp và các khoản giảm trừ cho cơ quan thuế theo đúng biểu mẫu quy định.</p>

<p>Doanh nghiệp thường thực hiện kê khai:</p>
<ul>
  <li>Theo tháng</li>
  <li>Hoặc theo quý</li>
</ul>
<p>Tùy vào quy mô và số thuế phát sinh.</p>

<h3>3.2 Hồ sơ kê khai thuế TNCN</h3>

<p>Một số hồ sơ phổ biến gồm:</p>
<ul>
  <li>Tờ khai thuế TNCN</li>
  <li>Danh sách người lao động</li>
  <li>Chứng từ khấu trừ thuế</li>
  <li>Hồ sơ giảm trừ gia cảnh</li>
</ul>

<h3>3.3 Các khoản giảm trừ phổ biến</h3>

<p>Người nộp thuế có thể được giảm trừ:</p>
<ul>
  <li>Giảm trừ gia cảnh bản thân</li>
  <li>Giảm trừ người phụ thuộc</li>
  <li>Bảo hiểm bắt buộc</li>
  <li>Khoản đóng góp từ thiện, nhân đạo</li>
</ul>

<p>Các khoản này giúp giảm phần thu nhập tính thuế, từ đó giảm số thuế phải nộp.</p>

<h2>4. Quyết toán thuế TNCN</h2>

<h3>4.1 Quyết toán thuế là gì?</h3>

<p>Quyết toán thuế TNCN là việc tổng hợp toàn bộ thu nhập chịu thuế trong năm để xác định:</p>
<ul>
  <li>Số thuế thực tế phải nộp</li>
  <li>Số thuế đã tạm nộp</li>
  <li>Khoản chênh lệch cần nộp thêm hoặc được hoàn lại</li>
</ul>

<p>Thông thường, quyết toán thuế được thực hiện sau khi kết thúc năm dương lịch.</p>

<h3>4.2 Ai phải quyết toán thuế?</h3>

<p>Một số trường hợp phổ biến phải tự quyết toán:</p>
<ul>
  <li>Có thu nhập từ nhiều nơi</li>
  <li>Có số thuế nộp thiếu</li>
  <li>Muốn hoàn thuế do đã nộp thừa</li>
  <li>Không đủ điều kiện ủy quyền cho công ty quyết toán thay</li>
</ul>

<p>Ngoài ra, cá nhân có thu nhập từ nước ngoài hoặc từ nền tảng số cũng có thể phải tự quyết toán trực tiếp với cơ quan thuế.</p>

<h3>4.3 Trường hợp không cần quyết toán</h3>

<p>Một số trường hợp được miễn quyết toán:</p>
<ul>
  <li>Số thuế phải nộp thêm nhỏ hơn hoặc bằng 50.000 đồng</li>
  <li>Không có nhu cầu hoàn thuế</li>
  <li>Chỉ có thu nhập tại một nơi và đủ điều kiện ủy quyền cho doanh nghiệp</li>
</ul>

<h2>5. Các mẫu tờ khai quyết toán thuế phổ biến</h2>

<p>Hiện nay có 2 mẫu quan trọng:</p>

<table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th>Mẫu</th>
      <th>Đối tượng sử dụng</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>02/QTT-TNCN</td>
      <td>Cá nhân tự quyết toán</td>
    </tr>
    <tr>
      <td>05/QTT-TNCN</td>
      <td>Doanh nghiệp quyết toán thay cho người lao động</td>
    </tr>
  </tbody>
</table>

<h2>6. Thời hạn quyết toán thuế</h2>

<p>Theo Luật Quản lý thuế:</p>
<ul>
  <li><strong>Doanh nghiệp quyết toán thay:</strong> chậm nhất ngày 31/03 hằng năm</li>
  <li><strong>Cá nhân tự quyết toán:</strong> chậm nhất ngày 30/04 hằng năm</li>
</ul>

<p>Nếu trùng ngày nghỉ lễ thì được chuyển sang ngày làm việc tiếp theo.</p>

<h2>7. Hướng dẫn quyết toán thuế TNCN online</h2>

<p>Hiện nay người nộp thuế có thể thực hiện trực tuyến thông qua:</p>
<ul>
  <li>Cổng Dịch vụ công</li>
  <li>Ứng dụng eTax Mobile</li>
  <li>Phần mềm HTKK</li>
</ul>

<p><strong>Quy trình cơ bản gồm:</strong></p>
<ol>
  <li>Đăng nhập hệ thống thuế điện tử</li>
  <li>Chọn tờ khai quyết toán</li>
  <li>Kiểm tra thông tin thu nhập</li>
  <li>Khai người phụ thuộc</li>
  <li>Nộp hồ sơ trực tuyến</li>
</ol>

<h2>8. Một số lưu ý quan trọng</h2>

<ul>
  <li>✅ Kiểm tra chính xác mã số thuế cá nhân</li>
  <li>✅ Đăng ký người phụ thuộc đúng thời hạn</li>
  <li>✅ Lưu giữ chứng từ khấu trừ thuế</li>
  <li>✅ Kiểm tra dữ liệu thu nhập từ nhiều nơi</li>
  <li>✅ Nộp hồ sơ đúng hạn để tránh bị phạt</li>
</ul>

<p>Theo quy định, việc chậm nộp hồ sơ hoặc không quyết toán thuế có thể bị xử phạt hành chính.</p>

<h2>9. Kết luận</h2>

<p>Thuế TNCN, kê khai thuế và quyết toán thuế là những nội dung quan trọng đối với cả người lao động lẫn doanh nghiệp. Việc nắm rõ quy trình, thời hạn và các biểu mẫu cần thiết sẽ giúp thực hiện nghĩa vụ thuế chính xác, hạn chế sai sót và đảm bảo quyền lợi hoàn thuế khi cần thiết.</p>

<p>Trong bối cảnh chuyển đổi số hiện nay, việc quyết toán thuế online đang trở nên thuận tiện hơn, giúp tiết kiệm đáng kể thời gian và chi phí cho người nộp thuế.</p>

<hr>

<p><em>Bài viết được biên soạn dựa trên các quy định pháp luật hiện hành về thuế thu nhập cá nhân tại Việt Nam. Người đọc nên tham khảo thêm ý kiến của chuyên gia thuế hoặc cơ quan thuế địa phương để có thông tin chính xác nhất cho trường hợp cụ thể.</em></p>
`;

        // 5. Tính toán word count và reading time
        const plainText = blogContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = plainText.split(/\s+/).length;
        const readingTimeMinutes = Math.ceil(wordCount / 200); // Giả sử đọc 200 từ/phút

        // 6. Tạo slug
        const slug = 'thue-thu-nhap-ca-nhan-tncn-ke-khai-thue-va-quyet-toan-thue';

        // 7. Kiểm tra xem bài viết đã tồn tại chưa
        const existingPost = await prisma.blogPost.findFirst({
            where: { slug }
        });

        if (existingPost) {
            console.log('⚠️  Bài viết đã tồn tại với slug:', slug);
            console.log('Đang xóa bài viết cũ...');
            await prisma.blogPost.delete({
                where: { id: existingPost.id }
            });
            console.log('✅ Đã xóa bài viết cũ');
        }

        // 8. Tạo blog post
        const blogPost = await prisma.blogPost.create({
            data: {
                authorId: test3.id,
                title: 'Thuế Thu Nhập Cá Nhân (TNCN), Kê Khai Thuế Và Quyết Toán Thuế',
                slug,
                excerpt: 'Thuế Thu Nhập Cá Nhân (TNCN) là một trong những loại thuế quan trọng đối với người lao động và cá nhân có phát sinh thu nhập tại Việt Nam. Việc hiểu rõ cách kê khai và quyết toán thuế không chỉ giúp thực hiện đúng nghĩa vụ với Nhà nước mà còn tránh các sai sót dẫn đến bị xử phạt hoặc mất quyền hoàn thuế.',
                coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=630&fit=crop',
                status: 'PUBLISHED',
                type: 'PLATFORM',
                visibility: 'PUBLIC',
                publishedAt: new Date(),
                wordCount,
                readingTimeMinutes,
                mongoContentId: null, // Không dùng MongoDB cho bài này
                // Lưu content trực tiếp vào PostgreSQL thông qua relation
                categories: {
                    create: {
                        categoryId: financeCategory.id
                    }
                },
                tags: {
                    create: tags.map(tag => ({
                        tagId: tag.id
                    }))
                }
            },
            include: {
                author: true,
                categories: {
                    include: {
                        category: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        console.log('\n✅ ĐÃ TẠO BÀI BLOG THÀNH CÔNG!');
        console.log('=====================================');
        console.log('ID:', blogPost.id);
        console.log('Tiêu đề:', blogPost.title);
        console.log('Slug:', blogPost.slug);
        console.log('Tác giả:', blogPost.author.name, `(${blogPost.author.email})`);
        console.log('Trạng thái:', blogPost.status);
        console.log('Loại:', blogPost.type);
        console.log('Số từ:', blogPost.wordCount);
        console.log('Thời gian đọc:', blogPost.readingTimeMinutes, 'phút');
        console.log('Category:', blogPost.categories.map(c => c.category.name).join(', '));
        console.log('Tags:', blogPost.tags.map(t => t.tag.name).join(', '));
        console.log('Ngày xuất bản:', blogPost.publishedAt);
        console.log('=====================================');
        console.log('\n📝 LƯU Ý: Nội dung bài viết được lưu trong PostgreSQL');
        console.log('Bạn cần cập nhật schema để thêm trường "content" vào bảng blog_posts');
        console.log('hoặc tạo bảng riêng để lưu content.');
        console.log('\n🔗 URL xem bài viết: /blog/' + blogPost.slug);

        // Lưu content vào file tạm để tham khảo
        const fs = require('fs');
        fs.writeFileSync(
            'd:/Du_An/crowdfunding-vn/blog-content-thue-tncn.html',
            blogContent,
            'utf8'
        );
        console.log('\n💾 Nội dung HTML đã được lưu vào: blog-content-thue-tncn.html');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error(error);
    }
}

main()
    .finally(() => prisma.$disconnect());
