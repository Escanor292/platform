'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPostResponse } from '@/types/blog.types';
import { BlogCard } from './BlogCard';
import { PlusCircle } from 'lucide-react';

interface CampaignUpdatesSectionProps {
  campaignId: string;
  isOwner?: boolean;
}

export function CampaignUpdatesSection({ campaignId, isOwner }: CampaignUpdatesSectionProps) {
  const [posts, setPosts] = useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, [campaignId]);

  const fetchUpdates = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/blog-posts?limit=3`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch campaign updates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cập nhật từ chiến dịch</h2>
        {isOwner && (
          <Link
            href={`/blog/editor?campaignId=${campaignId}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Viết cập nhật
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Chưa có cập nhật nào từ chiến dịch này.</p>
          {isOwner && (
            <Link
              href={`/blog/editor?campaignId=${campaignId}`}
              className="inline-block mt-4 text-blue-600 hover:text-blue-700"
            >
              Tạo cập nhật đầu tiên →
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          <div className="text-center">
            <Link
              href={`/blog?campaignId=${campaignId}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem tất cả cập nhật →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
