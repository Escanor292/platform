// ============================================================
// Blog List Page
// ============================================================

import { Suspense } from 'react';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogPostResponse } from '@/types/blog.types';

async function getBlogPosts(searchParams: any) {
  const params = new URLSearchParams();
  if (searchParams.page) params.set('page', searchParams.page);
  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.type) params.set('type', searchParams.type);
  if (searchParams.sort) params.set('sort', searchParams.sort);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/blog/posts?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch blog posts');
  }

  return res.json();
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const data = await getBlogPosts(searchParams);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
          <p className="text-gray-600">
            Tin tức, câu chuyện và cập nhật từ cộng đồng crowdfunding
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterButton href="/blog" label="Tất cả" active={!searchParams.type} />
          <FilterButton
            href="/blog?type=PLATFORM"
            label="Tin tức"
            active={searchParams.type === 'PLATFORM'}
          />
          <FilterButton
            href="/blog?type=CAMPAIGN_UPDATE"
            label="Cập nhật dự án"
            active={searchParams.type === 'CAMPAIGN_UPDATE'}
          />
          <FilterButton
            href="/blog?type=STORY"
            label="Câu chuyện"
            active={searchParams.type === 'STORY'}
          />
        </div>

        {/* Blog Grid */}
        <Suspense fallback={<BlogGridSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.posts.map((post: BlogPostResponse) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </Suspense>

        {/* Pagination */}
        {data.total > data.limit && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(data.total / data.limit) }, (_, i) => i + 1).map(
              (page) => (
                <a
                  key={page}
                  href={`/blog?page=${page}${searchParams.type ? `&type=${searchParams.type}` : ''}`}
                  className={`px-4 py-2 rounded ${
                    page === data.page
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
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active
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
