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

    const [result, featuredResult] = await Promise.all([
      getBlogPostList(query),
      getBlogPostList({ ...query, featured: true, limit: 3 }),
    ]);

    return { posts: result.posts, total: result.total, page: result.page, limit: result.limit, featuredPosts: featuredResult.posts };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Return empty result on error
    return { posts: [], total: 0, page: 1, limit: 10, featuredPosts: [] };
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 gradient-warm">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(46,139,87,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(47,128,237,0.1) 0%, transparent 50%)'
        }} />
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-md bg-white/55 border border-white/70 text-pgreen text-xs font-bold mb-6 shadow-lg">
              Câu chuyện cộng đồng
            </div>
            <h1 className="font-display font-black text-5xl lg:text-6xl text-dblue mb-6 leading-tight">
              Blog TửTế Fund
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              Nơi chia sẻ câu chuyện gây quỹ, hành trình tử tế và những cập nhật minh bạch từ cộng đồng.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-dblue mb-2">Khám phá bài viết</h2>
            <p className="text-gray-600">
              Đọc những câu chuyện thú vị từ các creator và cộng đồng
            </p>
          </div>

          {session?.user && (
            <Link
              href="/blog/editor"
              className="inline-flex items-center gap-2 rounded-2xl gradient-green px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-green-200"
            >
              <Plus className="w-5 h-5" />
              Viết bài mới
            </Link>
          )}
        </div>

        {/* Featured Posts */}
        {data.featuredPosts && data.featuredPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-dblue">
              <span className="h-2 w-2 rounded-full bg-pgreen"></span>
              Bài viết nổi bật
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.featuredPosts.map((post: BlogPostResponse) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

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
            label="Cập nhật chiến dịch"
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
            <div className="py-16 text-center">
              <div className="mb-4 text-gray-400">
                <svg
                  className="mx-auto h-20 w-20"
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
              <h3 className="mb-2 font-display text-2xl font-semibold text-dblue">
                Chưa có bài viết nào
              </h3>
              <p className="mb-6 max-w-md mx-auto text-gray-600">
                Hãy quay lại sau để đọc những câu chuyện thú vị từ cộng đồng crowdfunding
              </p>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-2xl gradient-green px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-green-200"
              >
                Khám phá chiến dịch
              </Link>
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
                  className={`rounded-full px-4 py-2 font-medium transition-colors ${page === data.page
                    ? 'bg-pgreen text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active
        ? 'bg-pgreen text-white'
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
        <div key={i} className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-200">
          <div className="h-48 w-full bg-gray-200 animate-pulse" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
            <div className="h-6 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
