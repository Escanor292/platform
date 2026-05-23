// ============================================================
// Blog List Page
// ============================================================

import { Suspense } from 'react';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogPostResponse } from '@/types/blog.types';
import { getBlogPostList } from '@/lib/blog/blog.service';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Plus } from 'lucide-react';

async function getBlogPosts(searchParams: any) {
  try {
    const query = {
      page: parseInt(searchParams.page || '1'),
      limit: parseInt(searchParams.limit || '10'),
      search: searchParams.search || undefined,
      category: searchParams.category || undefined,
      tag: searchParams.tag || undefined,
      type: searchParams.type || undefined,
      sort: searchParams.sort || 'latest',
    };

    const result = await getBlogPostList(query);
    return result;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Return empty result on error
    return { posts: [], total: 0, page: 1, limit: 10 };
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const data = await getBlogPosts(params);
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
            <p className="text-gray-600">
              Tin tức, câu chuyện và cập nhật từ cộng đồng crowdfunding
            </p>
          </div>

          {session?.user && (
            <Link
              href="/blog/editor"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Viết bài mới
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterButton href="/blog" label="Tất cả" active={!params.type} />
          <FilterButton
            href="/blog?type=PLATFORM"
            label="Tin tức"
            active={params.type === 'PLATFORM'}
          />
          <FilterButton
            href="/blog?type=CAMPAIGN_UPDATE"
            label="Cập nhật dự án"
            active={params.type === 'CAMPAIGN_UPDATE'}
          />
          <FilterButton
            href="/blog?type=STORY"
            label="Câu chuyện"
            active={params.type === 'STORY'}
          />
        </div>

        {/* Blog Grid */}
        <Suspense fallback={<BlogGridSkeleton />}>
          {data.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.posts.map((post: BlogPostResponse) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-600">
                Hãy quay lại sau để đọc những câu chuyện thú vị từ cộng đồng
              </p>
            </div>
          )}
        </Suspense>

        {/* Pagination */}
        {data.total > data.limit && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(data.total / data.limit) }, (_, i) => i + 1).map(
              (page) => (
                <a
                  key={page}
                  href={`/blog?page=${page}${params.type ? `&type=${params.type}` : ''}`}
                  className={`px-4 py-2 rounded ${page === data.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {page}
                </a>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
    >
      {label}
    </a>
  );
}

function BlogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="w-full h-48 bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
