const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🚀 Bắt đầu cập nhật nội dung bài blog...');

        // Đọc nội dung HTML từ file
        const content = fs.readFileSync('d:/Du_An/crowdfunding-vn/blog-content-thue-tncn.html', 'utf8');

        // Tìm bài blog
        const blogPost = await prisma.blogPost.findFirst({
            where: {
                slug: 'thue-thu-nhap-ca-nhan-tncn-ke-khai-thue-va-quyet-toan-thue'
            }
        });

        if (!blogPost) {
            console.log('❌ Không tìm thấy bài blog');
            return;
        }

        // Cập nhật nội dung
        const updated = await prisma.blogPost.update({
            where: { id: blogPost.id },
            data: { content },
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

        console.log('\n✅ ĐÃ CẬP NHẬT NỘI DUNG BÀI BLOG THÀNH CÔNG!');
        console.log('=====================================');
        console.log('ID:', updated.id);
        console.log('Tiêu đề:', updated.title);
        console.log('Slug:', updated.slug);
        console.log('Tác giả:', updated.author.name, `(${updated.author.email})`);
        console.log('Trạng thái:', updated.status);
        console.log('Số từ:', updated.wordCount);
        console.log('Thời gian đọc:', updated.readingTimeMinutes, 'phút');
        console.log('Độ dài nội dung:', content.length, 'ký tự');
        console.log('Category:', updated.categories.map(c => c.category.name).join(', '));
        console.log('Tags:', updated.tags.map(t => t.tag.name).join(', '));
        console.log('=====================================');
        console.log('\n🔗 URL xem bài viết: /blog/' + updated.slug);

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error(error);
    }
}

main()
    .finally(() => prisma.$disconnect());
