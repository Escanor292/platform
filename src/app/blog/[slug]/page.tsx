// ============================================================
// Blog Detail Page
// ============================================================

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, Heart, Bookmark, Clock } from 'lucide-react';
import { BlogPostResponse } from '@/types/blog.types';
import { BlogCommentSection } from '@/components/blog/BlogCommentSection';
import { Metadata } from 'next';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import { ProductBoxRenderer } from '@/components/shared/ProductBoxRenderer';
import { auth } from '@/lib/auth';
import BlogDetailPageClient from './BlogDetailPageClient';
import ReportButton from '@/components/report/ReportButton';
import { ShareButton } from '@/components/seo/ShareButton';
import { JsonLd } from '@/components/seo/JsonLd';
import { absoluteUrl, buildSocialMetadata } from '@/lib/seo';
import {
  getBlogPostBySlug,
  getBlogPostList,
} from '@/lib/blog/blog.service';

/**
 * Fetch blog post directly from the service layer (no self-host HTTP fetch).
 * Returns { post, error } instead of throwing, so the page can render a
 * friendly error UI instead of crashing the server.
 */
async function getBlogPost(slug: string, currentUserId?: string) {
  try {
    const post = await getBlogPostBySlug(slug, currentUserId);
    const err: 'not-found' = 'not-found';
    if (!post) return { post: null, error: err };
    return { post, error: null as any };
  } catch (error: any) {
    console.error('[BLOG] Failed to fetch post:', error?.message || error);
    // Permission errors should show a friendly message, not crash
    const err: 'forbidden' | 'error' = error?.message?.includes('permission')
      ? 'forbidden'
      : 'error';
    return { post: null, error: err };
  }
}

async function getRelatedPosts(currentPostId: string) {
  try {
    const result = await getBlogPostList({ page: 1, limit: 3, sort: 'latest' });
    return result.posts.filter((post: any) => post.id !== currentPostId).slice(0, 3);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { post } = await getBlogPost(slug);

    if (!post || post.status !== 'PUBLISHED' || (post.publishedAt && new Date(post.publishedAt).getTime() > Date.now())) {
      return {
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    return buildSocialMetadata({
      title: post.title,
      description: post.excerpt || post.content,
      path: `/blog/${slug}`,
      image: post.coverImage,
      type: 'article',
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
    });
  } catch (error) {
    return {
      title: 'Blog',
      description: 'Tin tức, câu chuyện và cập nhật từ cộng đồng gây quỹ Tử Tế Fund',
    };
  }
}



export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const currentUserId = (session?.user as any)?.id;
  const { post, error } = await getBlogPost(slug, currentUserId);

  const isAuthor = !!currentUserId && post ? currentUserId === post.author?.id : false;

  if (error === 'not-found') {
    notFound();
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-dblue mb-3">Không thể tải bài viết</h1>
          <p className="text-gray-600 mb-6">
            {error === 'forbidden'
              ? 'Bạn không có quyền xem bài viết này.'
              : 'Đã có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.'}
          </p>
          <div className="flex justify-center gap-3">
            <a
              href={`/blog/${slug}`}
              className="rounded-full gradient-green px-5 py-2.5 text-sm font-semibold text-white"
            >
              Thử lại
            </a>
            <Link
              href="/blog"
              className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Về trang Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const relatedPosts = await getRelatedPosts(post.id);
  const relatedProject = post.project || post.campaign?.project;

  return (
    <BlogDetailPageClient post={post} isOwner={isAuthor}>
      <div className="min-h-screen bg-white">
        {/* Breadcrumbs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-4xl px-6 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-pgreen transition-colors">
                Trang chủ
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-pgreen transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="max-w-xs truncate font-medium text-dblue">
                {post.title}
              </span>
            </nav>
          </div>
        </div>

        <article className="mx-auto max-w-4xl px-6 py-8">
          {/* Header */}
          <header className="mb-8">
            {post.status !== 'PUBLISHED' && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Đây là bản xem trước. Bài viết đang ở trạng thái {post.status === 'PENDING_REVIEW' ? 'chờ duyệt' : post.status === 'REJECTED' ? 'bị từ chối' : post.status === 'DRAFT' ? 'nháp' : post.status} và chưa hiện trên trang Blog công khai.
              </div>
            )}
            {post.status === 'PUBLISHED' && post.publishedAt && new Date(post.publishedAt).getTime() > Date.now() && (
              <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Bài đã được duyệt và sẽ hiển thị công khai từ {new Date(post.publishedAt).toLocaleString('vi-VN')}.
              </div>
            )}
            {/* Type Badge */}
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-pgreen/10 px-3 py-1 text-sm font-medium text-pgreen">
                {getTypeLabel(post.type)}
              </span>
              {relatedProject && (
                <Link
                  href={`/projects/${relatedProject.id}`}
                  className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  → Dự án: {relatedProject.title}
                </Link>
              )}
              {post.campaign && (
                <Link
                  href={`/campaigns/${post.campaign.slug}`}
                  className="inline-flex items-center rounded-full bg-pgreen/10 px-3 py-1 text-sm font-medium text-pgreen hover:bg-pgreen/20 transition-colors"
                >
                  → Chiến dịch: {post.campaign.title}
                </Link>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-4 font-display text-4xl font-bold text-dblue leading-tight md:text-5xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="mb-6 text-xl text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
              {post.author?.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <div className="font-medium text-dblue">{post.author?.name}</div>
                <div className="flex items-center gap-2">
                  <span>
                    {post.publishedAt
                      ? formatDistanceToNow(new Date(post.publishedAt), {
                        addSuffix: true,
                        locale: vi,
                      })
                      : 'Chưa xuất bản'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readingTimeMinutes} phút đọc
                  </span>
                </div>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex items-center justify-between border-y border-gray-200 py-4">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-tblue" />
                  <span>{post.viewCount} lượt xem</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pgreen" />
                  <span>{post.likeCount} thích</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-full p-2 transition-colors hover:bg-gray-100">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="rounded-full p-2 transition-colors hover:bg-gray-100">
                  <Bookmark className="w-5 h-5" />
                </button>
                <ShareButton
                  title={post.title}
                  text={post.excerpt || post.title}
                  path={`/blog/${post.slug}`}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                />
                <ReportButton
                  targetType="BLOG"
                  targetId={post.id}
                  targetTitle={post.title}
                  className="rounded-full p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                  label=""
                />
              </div>
            </div>
          </header>


          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative mb-8 h-96 w-full overflow-hidden rounded-3xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="mb-8">
            {post.content && (
              <>
                <RichTextRenderer content={post.content} />
                <ProductBoxRenderer />
              </>
            )}
            {post.richContent && (
              <div className="prose prose-lg max-w-none prose-headings:text-dblue prose-a:text-pgreen prose-strong:text-dblue">
                {post.richContent.blocks.map((block, index) => (
                  <RenderBlock key={index} block={block} />
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <a
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className="rounded-full bg-cream px-3 py-1 text-sm text-gray-600 hover:bg-pgreen/10 hover:text-pgreen"
                >
                  #{tag.name}
                </a>
              ))}
            </div>
          )}

          {/* Author Card */}
          <div className="glass rounded-3xl border border-white/50 p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-4">
              {post.author?.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-dblue">{post.author?.name}</h3>
                <p className="text-sm text-gray-600">Tác giả</p>
              </div>
              {post.author && (
                <Link
                  href={`/profile/${post.author.id}`}
                  className="rounded-full bg-pgreen/10 px-4 py-2 text-sm font-medium text-pgreen hover:bg-pgreen/20"
                >
                  Xem hồ sơ
                </Link>
              )}
            </div>
          </div>

          {/* CTA Section */}
          {post.campaign && (
            <div className="mb-8 rounded-3xl border border-pgreen/20 bg-gradient-to-r from-pgreen/10 to-fgreen/10 p-8">
              <h3 className="mb-4 font-display text-2xl font-bold text-dblue">
                Hỗ trợ chiến dịch này
              </h3>
              <p className="mb-6 text-gray-600">
                Bài viết này là một phần của chiến dịch "{post.campaign.title}".
                Hãy ủng hộ để giúp hiện thực hóa dự án này.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/campaigns/${post.campaign.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl gradient-green px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-green-200"
                >
                  Xem chiến dịch
                </Link>
                <Link
                  href={`/campaigns/${post.campaign.slug}/pledge`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-pgreen/30 bg-white px-6 py-3 font-semibold text-pgreen hover:bg-pgreen/10"
                >
                  Ủng hộ ngay
                </Link>
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-dblue">
                <span className="h-2 w-2 rounded-full bg-pgreen"></span>
                Bài viết liên quan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost: BlogPostResponse) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all hover:shadow-lg hover:border-pgreen/30"
                  >
                    {relatedPost.coverImage && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={relatedPost.coverImage}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="mb-2 line-clamp-2 font-semibold text-dblue">
                        {relatedPost.title}
                      </h4>
                      {relatedPost.excerpt && (
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {relatedPost.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <BlogCommentSection postSlug={post.slug} />

          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt || '',
              image: post.coverImage,
              author: {
                '@type': 'Person',
                name: post.author?.name || '',
              },
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              url: absoluteUrl(`/blog/${post.slug}`),
            }}
          />
        </article>
      </div>
    </BlogDetailPageClient>
  );
}

function RenderBlock({ block }: { block: any }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.data.text}</p>;
    case 'heading':
      const HeadingTag = `h${block.data.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return <HeadingTag>{block.data.text}</HeadingTag>;
    case 'image':
      return (
        <figure>
          <img src={block.data.url} alt={block.data.alt || ''} />
          {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PLATFORM: 'Tin tức',
    CAMPAIGN_UPDATE: 'Cập nhật chiến dịch',
    ANNOUNCEMENT: 'Thông báo',
    STORY: 'Câu chuyện',
    IMPACT_REPORT: 'Báo cáo tác động',
  };
  return labels[type] || type;
}
