'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { BlogPostResponse } from '@/types/blog.types';
import { BlogCard } from '@/components/blog/BlogCard';
import { toast } from 'sonner';

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
        ...(filter !== 'all' && { status: filter }),
      });
      const res = await fetch(`/api/blog/my-posts?${params.toString()}`);
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
      const res = await fetch(`/api/blog/posts/${slug}`, { method: 'DELETE' });
      if (res.ok) fetchMyPosts();
      else alert('Không thể xóa bài viết');
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const withdraw = async (slug: string) => {
    try {
      const res = await fetch(`/api/blog/posts/${slug}/withdraw`, { method: 'PATCH' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không rút được bài');
      toast.success('Đã rút bài về bản nháp');
      fetchMyPosts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    }
  };

  const resubmit = async (slug: string) => {
    try {
      const res = await fetch(`/api/blog/posts/${slug}/publish`, { method: 'PATCH' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không gửi duyệt được');
      toast.success(data.status === 'PENDING_REVIEW' ? 'Đã gửi duyệt lại' : 'Đã xuất bản');
      fetchMyPosts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-pgreen" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display mb-2 text-3xl font-bold text-dblue">Bài viết của tôi</h1>
            <p className="text-gray-600">Quản lý các bài viết bạn đã tạo</p>
          </div>
          <Link href="/blog/editor" className="flex items-center gap-2 rounded-2xl gradient-green px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-green-200">
            <PlusCircle className="h-5 w-5" />
            Tạo bài viết mới
          </Link>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Tất cả" />
          <FilterButton active={filter === 'DRAFT'} onClick={() => setFilter('DRAFT')} label="Bản nháp" />
          <FilterButton active={filter === 'PENDING_REVIEW'} onClick={() => setFilter('PENDING_REVIEW')} label="Chờ duyệt" />
          <FilterButton active={filter === 'PUBLISHED'} onClick={() => setFilter('PUBLISHED')} label="Đã xuất bản" />
          <FilterButton active={filter === 'REJECTED'} onClick={() => setFilter('REJECTED')} label="Bị từ chối" />
          <FilterButton active={filter === 'ARCHIVED'} onClick={() => setFilter('ARCHIVED')} label="Lưu trữ" />
        </div>
        {posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-500">Bạn chưa có bài viết nào</p>
            <Link href="/blog/editor" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <PlusCircle className="h-5 w-5" />
              Tạo bài viết đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post.id} className="relative">
                <BlogCard post={post} />
                <div className="absolute right-2 top-2 flex gap-2">
                  <Link href={`/blog/${post.slug}`} className="rounded-full bg-white p-2 shadow-md hover:bg-gray-100" title="Xem">
                    <Eye className="h-4 w-4 text-gray-600" />
                  </Link>
                  <Link href={`/blog/editor?slug=${post.slug}`} className="rounded-full bg-white p-2 shadow-md hover:bg-gray-100" title="Sửa">
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Link>
                  <button onClick={() => handleDelete(post.slug)} className="rounded-full bg-white p-2 shadow-md hover:bg-gray-100" title="Xóa">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
                <div className="absolute left-2 top-2">
                  <StatusBadge status={post.status} />
                </div>
                {post.status === 'REJECTED' && post.rejectionReason && (
                  <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    Lý do từ chối: {post.rejectionReason}
                    <button className="ml-2 font-semibold underline" onClick={() => resubmit(post.slug)}>
                      Gửi duyệt lại
                    </button>
                  </div>
                )}
                {post.status === 'PENDING_REVIEW' && (
                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Đang chờ Admin duyệt.
                    <button className="ml-2 font-semibold underline" onClick={() => withdraw(post.slug)}>
                      Rút về nháp
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active ? 'bg-pgreen text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`}>
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
