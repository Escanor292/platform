import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBlogReviewFields } from '@/lib/blog/blog-review';
import { getBlogContent } from '@/services/mongodb/blog.service';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import AdminBlogReviewPanel from '@/components/admin/AdminBlogReviewPanel';

export default async function AdminBlogPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'ADMIN' && !(session.user as any).isAdmin)) {
    redirect('/');
  }

  const { id } = await params;
  const post = await prisma.blog_posts.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true, avatar: true } },
      campaigns: { select: { id: true, title: true, slug: true } },
      projects: { select: { id: true, title: true, slug: true } },
    },
  });

  if (!post || post.deletedAt) notFound();

  const review = (await getBlogReviewFields([post.id]))[post.id];
  let content = post.content || '';
  try {
    const mongo = await getBlogContent(post.id);
    if (mongo?.content) content = mongo.content;
  } catch {
    // keep postgres content
  }

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <Link href="/dashboard/admin/blog" className="text-sm font-semibold text-pgreen">
            ← Hàng đợi biên tập
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-400">{post.type}</p>
          <h1 className="mt-1 text-3xl font-black text-gray-900">{post.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {post.users?.name || 'Ẩn danh'} · {post.users?.email} · {new Date(post.createdAt).toLocaleString('vi-VN')}
          </p>
          {post.excerpt && <p className="mt-4 text-gray-600">{post.excerpt}</p>}
          {post.coverImage && (
            <img src={post.coverImage} alt={post.title} className="mt-6 w-full rounded-2xl object-cover" />
          )}
          <div className="prose mt-8 max-w-none">
            {content ? <RichTextRenderer content={content} /> : <p className="text-gray-400">Chưa có nội dung.</p>}
          </div>
        </article>
        <AdminBlogReviewPanel
          postId={post.id}
          slug={post.slug}
          status={post.status}
          featured={post.isFeatured}
          rejectionReason={review?.rejectionReason || ''}
          reviewerNote={review?.reviewerNote || ''}
          scheduledAt={review?.scheduledAt ? new Date(review.scheduledAt).toISOString() : ''}
        />
      </div>
    </div>
  );
}
