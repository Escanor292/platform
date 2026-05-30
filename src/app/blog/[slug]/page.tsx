// ============================================================
// Blog Detail Page
// ============================================================

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, Heart, Bookmark, Share2, Clock } from 'lucide-react';
import { BlogPostResponse } from '@/types/blog.types';
import { BlogCommentSection } from '@/components/blog/BlogCommentSection';
import { Metadata } from 'next';

async function getBlogPost(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/blog/posts/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch blog post');
  }

  return res.json();
}

async function getRelatedPosts(slug: string, currentPostId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/blog/posts?limit=3`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.posts.filter((post: any) => post.id !== currentPostId).slice(0, 3);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const post = await getBlogPost(slug);

    if (post.status !== 'PUBLISHED') {
      return {
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${post.title} | TừTế Fund Blog`;
    const description = post.excerpt || post.content?.substring(0, 160) || '';
    const url = `${baseUrl}/blog/${slug}`;
    const imageUrl = post.coverImage || `${baseUrl}/og-image.jpg`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        siteName: 'TừTế Fund',
        locale: 'vi_VN',
        type: 'article',
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: [post.author?.name || ''],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: 'Blog | TừTế Fund',
      description: 'Tin tức, câu chuyện và cập nhật từ cộng đồng crowdfunding TừTế Fund',
    };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: BlogPostResponse = await getBlogPost(slug);
  const relatedPosts = await getRelatedPosts(slug, post.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-emerald-600 transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded">
              {getTypeLabel(post.type)}
            </span>
            {post.campaign && (
              <a
                href={`/campaigns/${post.campaign.slug}`}
                className="text-sm text-gray-600 hover:text-emerald-600"
              >
                → {post.campaign.title}
              </a>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
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
              <div className="font-medium text-gray-900">{post.author?.name}</div>
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
          <div className="flex items-center justify-between py-4 border-y border-gray-200">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount} lượt xem</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.likeCount} thích</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-8">
          {post.content && (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          )}
          {post.richContent && (
            <div>
              {post.richContent.blocks.map((block, index) => (
                <RenderBlock key={index} block={block} />
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <a
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100"
              >
                #{tag.name}
              </a>
            ))}
          </div>
        )}

        {/* Author Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 shadow-sm">
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
              <h3 className="font-semibold text-gray-900 text-lg">{post.author?.name}</h3>
              <p className="text-sm text-gray-600">Tác giả</p>
            </div>
            {post.author && (
              <Link
                href={`/profile/${post.author.id}`}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                Xem hồ sơ
              </Link>
            )}
          </div>
        </div>

        {/* CTA Section */}
        {post.campaign && (
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-8 mb-8 border border-emerald-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Hỗ trợ chiến dịch này
            </h3>
            <p className="text-gray-600 mb-6">
              Bài viết này là một phần của chiến dịch "{post.campaign.title}".
              Hãy ủng hộ để giúp hiện thực hóa dự án này.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/campaigns/${post.campaign.slug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Xem chiến dịch
              </Link>
              <Link
                href={`/campaigns/${post.campaign.slug}/pledge`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
              >
                Ủng hộ ngay
              </Link>
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
              Bài viết liên quan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost: BlogPostResponse) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-emerald-300 transition-all"
                >
                  {relatedPost.coverImage && (
                    <div className="relative w-full h-48">
                      <Image
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                      {relatedPost.title}
                    </h4>
                    {relatedPost.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2">
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

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${post.slug}`,
            }),
          }}
        />
      </article>
    </div>
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
    CAMPAIGN_UPDATE: 'Cập nhật dự án',
    ANNOUNCEMENT: 'Thông báo',
    STORY: 'Câu chuyện',
    IMPACT_REPORT: 'Báo cáo tác động',
  };
  return labels[type] || type;
}
