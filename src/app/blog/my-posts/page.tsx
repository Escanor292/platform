'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, Archive } from 'lucide-react';
import { BlogPostResponse } from '@/types/blog.types';
import { BlogCard } from '@/components/blog/BlogCard';

export default function MyPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchMyPosts();
    }
  }, [status, filter]);

  const fetchMyPosts = async () => {
    try {
      const params = new URLSearchParams({
        authorId: session?.user?.id || '',
        ...(filter !== 'all' && { status: filter }),
      });

      const res = await fetch(`/api/blog/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    try {
      const res = await fetch(`/api/blog/posts/${slug}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchMyPosts();
      } else {
        alert('Không thể xóa bài viết');
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài viết của tôi</h1>
            <p className="text-gray-600">Quản lý các bài viết bạn đã tạo</p>
          </div>
          <Link
            href="/blog/editor"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="w-5 h-5" />
            Tạo bài viết mới
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="Tất cả"
          />
          <FilterButton
            active={filter === 'DRAFT'}
            onClick={() => setFilter('DRAFT')}
            label="Bản nháp"
          />
          <FilterButton
            active={filter === 'PENDING_REVIEW'}
            onClick={() => setFilter('PENDING_REVIEW')}
            label="Chờ duyệt"
          />
          <FilterButton
            active={filter === 'PUBLISHED'}
            onClick={() => setFilter('PUBLISHED')}
            label="Đã xuất bản"
          />
          <FilterButton
            active={filter === 'ARCHIVED'}
            onClick={() => setFilter('ARCHIVED')}
            label="Lưu trữ"
          />
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Bạn chưa có bài viết nào</p>
            <Link
              href="/blog/editor"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircle className="w-5 h-5" />
              Tạo bài viết đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="relative">
                <BlogCard post={post} />
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    title="Xem"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </Link>
                  <Link
                    href={`/blog/editor?slug=${post.slug}`}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    title="Sửa"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <StatusBadge status={post.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-500 text-white',
    PENDING_REVIEW: 'bg-yellow-500 text-white',
    PUBLISHED: 'bg-green-500 text-white',
    ARCHIVED: 'bg-gray-400 text-white',
    REJECTED: 'bg-red-500 text-white',
  };

  const labels: Record<string, string> = {
    DRAFT: 'Nháp',
    PENDING_REVIEW: 'Chờ duyệt',
    PUBLISHED: 'Đã xuất bản',
    ARCHIVED: 'Lưu trữ',
    REJECTED: 'Bị từ chối',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status] || 'bg-gray-500 text-white'}`}>
      {labels[status] || status}
    </span>
  );
}
