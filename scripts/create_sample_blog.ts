import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AUTHOR_ID = 'cmphnhw8e0002so1uh16dwpvn'; // test3@gmail.com

// Content dạng JSON Tiptap để tương thích với ProductionEditor (tiptap)
const content = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Hành trình Mầm xanh tử tế: Từ hạt giống đến rừng cây' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Mầm xanh tử tế là dự án gây quỹ cộng đồng nhằm trồng và phủ xanh các trường học vùng khó khăn. Bài viết này chia sẻ hành trình của chúng tôi từ ngày đầu tiên và những điều sắp tới sẽ làm.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Vì sao chúng tôi bắt đầu?' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Chúng tôi tin rằng mỗi hạt giống gieo xuống hôm nay sẽ là một bóng mát cho thế hệ tương lai. Trẻ em vùng cao deserve một sân trường rợp bóng cây, nơi các em có thể học tập, vui chơi trong không gian xanh mát. Với sự chung tay của cộng đồng Tử Tế Fund, chúng tôi mong muốn mang cây xanh đến 100 trường học trong 3 năm tới.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Sản phẩm gây quỹ chính thức' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Để đồng hành cùng dự án, chúng tôi ra mắt bộ sản phẩm ',
        },
        { type: 'text', text: 'Bộ hạt giống cây xanh tử tế', marks: [{ type: 'bold' }] },
        {
          type: 'text',
          text: ' — gồm 5 loại cây: hoa mười giờ, hoa chiều tím, rau mầm, bạc hà và hướng thảo. Kèm đất dinh dưỡng, chậu giấy phân hủy sinh học và hướng dẫn trồng chi tiết. Mỗi bộ bạn nhận về là một mầm sống được gieo trồng tại chính gia đình bạn, và đóng góp của bạn sẽ được dùng để phủ xanh các trường học vùng khó khăn.',
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Mỗi người trồng một cây, một triệu người trồng một triệu cây. Sự tử tế sẽ lớn lên cùng những mầm xanh.',
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Kế hoạch tiếp theo' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Trong thời gian tới, chúng tôi sẽ tổ chức các buổi trồng cây cộng đồng, mời các bạn backer cùng tham gia và theo dõi tiến độ phủ xanh tại từng trường học qua các báo cập nhật định kỳ. Cảm ơn bạn đã đồng hành cùng hành trình Mầm xanh tử tế!',
        },
      ],
    },
  ],
});

const title = 'Hành trình Mầm xanh tử tế: Từ hạt giống đến rừng cây';
const slug = 'hanh-trinh-mam-xanh-tu-te';
const excerpt =
  'Mầm xanh tử tế là dự án gây quỹ cộng đồng nhằm trồng và phủ xanh các trường học vùng khó khăn. Cùng xem hành trình của chúng tôi từ hạt giống đến rừng cây.';

async function main() {
  // Kiểm tra tác giả tồn tại
  const author = await prisma.users.findUnique({ where: { id: AUTHOR_ID } });
  if (!author) throw new Error('Tác giả không tồn tại: ' + AUTHOR_ID);

  // Dự án Mầm xanh tử tế
  const project = await prisma.projects.findFirst({
    where: { creatorId: AUTHOR_ID },
    orderBy: { createdAt: 'asc' },
  });

  // Xóa blog cũ cùng slug nếu có
  await prisma.blog_posts.deleteMany({ where: { slug } });

  const plainText = content.replace(/[\[\]{}"\\]/g, ' ').replace(/\s+/g, ' ');
  const wordCount = plainText.split(' ').filter(Boolean).length;

  const post = await prisma.blog_posts.create({
    data: {
      id: randomUUID(),
      authorId: AUTHOR_ID,
      projectId: project?.id || null,
      title,
      slug,
      excerpt,
      coverImage: null,
      content,
      status: 'PUBLISHED' as any,
      type: 'PLATFORM' as any,
      visibility: 'PUBLIC' as any,
      publishedAt: new Date(),
      wordCount,
      readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200 / 5)),
      updatedAt: new Date(),
    },
  });

  console.log('Blog created:', post.id);
  console.log('Slug:', post.slug);
  console.log('Project:', project?.title || '(không thuộc dự án)');
  console.log('URL công khai: /blog/' + post.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
