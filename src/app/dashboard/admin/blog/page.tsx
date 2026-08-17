'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Check, X, Archive } from 'lucide-react';

export default function AdminBlogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING_REVIEW');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchPosts();
    }
  }, [status, filter]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        ...(filter !== 'all' && { status: filter }),
      });

      const res = await fetch(`/api/admin/blog/posts?${params.toString()}`);
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

  const handleReview = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchPosts();
      } else {
        alert('Không thể cập nhật trạng thái');
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pgreen mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-dblue mb-8">Quản lý Blog</h1>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
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
            active={filter === 'REJECTED'}
            onClick={() => setFilter('REJECTED')}
            label="Bị từ chối"
          />
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="Tất cả"
          />
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500">{post.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{post.author.name}</div>
                    <div className="text-sm text-gray-500">{post.author.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getTypeLabel(post.type)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{post.viewCount} views</div>
                    <div>{post._count.likes} likes</div>
                    <div>{post._count.comments} comments</div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-emerald-600 hover:text-emerald-900"
                        title="Xem"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      {post.status === 'PENDING_REVIEW' && (
                        <>
                          <button
                            onClick={() => handleReview(post.id, 'PUBLISHED')}
                            className="text-green-600 hover:text-green-900"
                            title="Duyệt"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReview(post.id, 'REJECTED')}
                            className="text-red-600 hover:text-red-900"
                            title="Từ chối"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleReview(post.id, 'ARCHIVED')}
                        className="text-gray-600 hover:text-gray-900"
                        title="Lưu trữ"
                      >
                        <Archive className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {posts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Không có bài viết nào
            </div>
          )}
        </div>
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
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active
        ? 'bg-pgreen text-white'
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
    PENDING_REVIEW: 'bg-ebrown text-white',
    PUBLISHED: 'bg-pgreen text-white',
    ARCHIVED: 'bg-gray-400 text-white',
    REJECTED: 'bg-red-600 text-white',
  };

  const labels: Record<string, string> = {
    DRAFT: 'Nháp',
    PENDING_REVIEW: 'Chờ duyệt',
    PUBLISHED: 'Đã xuất bản',
    ARCHIVED: 'Lưu trữ',
    REJECTED: 'Bị từ chối',
  };

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[status] || 'bg-gray-500 text-white'}`}>
      {labels[status] || status}
    </span>
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
