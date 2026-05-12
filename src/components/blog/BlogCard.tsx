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
      <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {post.isFeatured && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                Nổi bật
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {getTypeLabel(post.type)}
            </span>
            {post.campaign && (
              <span className="text-xs text-gray-500 truncate">
                {post.campaign.title}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
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
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{post.likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentCount}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Clock className="w-4 h-4" />
              <span>{post.readingTimeMinutes} phút đọc</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
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
    CAMPAIGN_UPDATE: 'Cập nhật dự án',
    ANNOUNCEMENT: 'Thông báo',
    STORY: 'Câu chuyện',
    IMPACT_REPORT: 'Báo cáo tác động',
  };
  return labels[type] || type;
}
