'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
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
    if (!confirm('Ban co chac muon xoa bai viet nay?')) return;
    try {
      const res = await fetch(`/api/blog/posts/${slug}`, { method: 'DELETE' });
      if (res.ok) fetchMyPosts();
      else alert('Khong the xoa bai viet');
    } catch (error) {
      alert('Co loi xay ra');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pgreen mx-auto mb-4" />
          <p className="text-gray-600">Dang tai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-dblue mb-2">Bai viet cua toi</h1>
            <p className="text-gray-600">Quan ly cac bai viet ban da tao</p>
          </div>
          <Link href="/blog/editor" className="flex items-center gap-2 rounded-2xl gradient-green px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-green-200">
            <PlusCircle className="w-5 h-5" />
            Tao bai viet moi
          </Link>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Tat ca" />
          <FilterButton active={filter === 'DRAFT'} onClick={() => setFilter('DRAFT')} label="Ban nhap" />
          <FilterButton active={filter === 'PENDING_REVIEW'} onClick={() => setFilter('PENDING_REVIEW')} label="Cho duyet" />
          <FilterButton active={filter === 'PUBLISHED'} onClick={() => setFilter('PUBLISHED')} label="Da xuat ban" />
          <FilterButton active={filter === 'REJECTED'} onClick={() => setFilter('REJECTED')} label="Bi tu choi" />
          <FilterButton active={filter === 'ARCHIVED'} onClick={() => setFilter('ARCHIVED')} label="Luu tru" />
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Ban chua co bai viet nao</p>
            <Link href="/blog/editor" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <PlusCircle className="w-5 h-5" />
              Tao bai viet dau tien
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="relative">
                <BlogCard post={post} />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Link href={`/blog/${post.slug}`} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100" title="Xem">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </Link>
                  <Link href={`/blog/editor?slug=${post.slug}`} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100" title="Sua">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Link>
                  <button onClick={() => handleDelete(post.slug)} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100" title="Xoa">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <StatusBadge status={post.status} />
                </div>
                {post.status === 'REJECTED' && post.rejectionReason && (
                  <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    Ly do tu choi: {post.rejectionReason}
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
    <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active ? 'bg-pgreen text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}>
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
    DRAFT: 'Nhap',
    PENDING_REVIEW: 'Cho duyet',
    PUBLISHED: 'Da xuat ban',
    ARCHIVED: 'Luu tru',
    REJECTED: 'Bi tu choi',
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[status] || 'bg-gray-500 text-white'}`}>
      {labels[status] || status}
    </span>
  );
}
