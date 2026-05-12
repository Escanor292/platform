// ============================================================
// Blog Detail Page
// ============================================================

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, Heart, Bookmark, Share2, Clock } from 'lucide-react';
import { BlogPostResponse } from '@/types/blog.types';
import { BlogCommentSection } from '@/components/blog/BlogCommentSection';

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

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const post: BlogPostResponse = await getBlogPost(params.slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded">
              {getTypeLabel(post.type)}
            </span>
            {post.campaign && (
              <a
                href={`/campaigns/${post.campaign.slug}`}
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                → {post.campaign.title}
              </a>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

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
                className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
              >
                #{tag.name}
              </a>
            ))}
          </div>
        )}

        {/* Author Card */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
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
            <div>
              <h3 className="font-semibold text-gray-900">{post.author?.name}</h3>
              <p className="text-sm text-gray-600">Tác giả</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <BlogCommentSection postSlug={post.slug} />
      </article>
    </div>
  );
}

function RenderBlock({ block }: { block: any }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.data.text}</p>;
    case 'heading':
      const HeadingTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
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
