'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BlogPostResponse } from '@/types/blog.types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, Heart, MessageCircle, Clock } from 'lucide-react';
import { UserBadgeList } from '@/components/badge/UserBadgeList';

interface BlogCardProps {
  post: BlogPostResponse;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="group overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {post.isFeatured && (
              <div className="absolute top-3 right-3 rounded-full bg-ebrown px-3 py-1.5 text-xs font-semibold text-white">
                Nổi bật
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Type Badge */}
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-pgreen/10 px-3 py-1 text-xs font-medium text-pgreen">
              {getTypeLabel(post.type)}
            </span>
            {post.campaign && (
              <span className="truncate text-xs text-gray-500">
                {post.campaign.title}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-3 line-clamp-2 font-display text-xl font-bold text-dblue transition-colors group-hover:text-pgreen">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Author & Date */}
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {post.author?.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>{post.author?.name}</span>
              <span>•</span>
              <span>
                {post.publishedAt
                  ? formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                    locale: vi,
                  })
                  : 'Chưa xuất bản'}
              </span>
            </div>
            {post.author?.id && (
              <div className="ml-8">
                <UserBadgeList userId={post.author.id} compact maxDisplay={2} />
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-tblue" />
              <span>{post.viewCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-pgreen" />
              <span>{post.likeCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-tblue" />
              <span>{post.commentCount}</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{post.readingTimeMinutes} phút</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-cream px-2 py-1 text-xs text-gray-600"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
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
