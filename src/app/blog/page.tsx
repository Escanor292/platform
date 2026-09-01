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
      <section
        className="relative overflow-hidden px-6 py-20 md:py-28"
        style={{
          background: 'linear-gradient(180deg, #F8F7F2 0%, #f0f8f4 50%, #F8F7F2 100%)'
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[5%] top-10 h-80 w-80 rounded-full bg-gradient-to-br from-pgreen/20 via-pgreen/8 to-transparent blur-3xl opacity-70" />
          <div className="absolute right-[8%] top-32 h-80 w-80 rounded-full bg-gradient-to-tl from-tblue/15 via-transparent to-transparent blur-3xl opacity-60" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/55 px-5 py-2.5 text-xs font-bold text-pgreen shadow-lg backdrop-blur-md">
            Câu chuyện cộng đồng
          </div>
          <h1 className="font-display mb-5 font-black text-4xl text-dblue md:text-5xl lg:text-6xl">
            Câu chuyện <span className="bg-gradient-to-r from-pgreen via-fgreen to-tblue bg-clip-text text-transparent">tử tế</span> được kể lại
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
            Nơi chia sẻ hành trình gây quỹ, cập nhật minh bạch và những câu chuyện đồng hành từ cộng đồng TửTế Fund.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display mb-2 font-bold text-2xl text-dblue md:text-3xl">Khám phá bài viết</h2>
            <p className="text-gray-600">
              Đọc những câu chuyện từ creator và cộng đồng
            </p>
          </div>

          {session?.user && (
            <Link
              href="/blog/editor"
              className="inline-flex items-center gap-2 rounded-2xl gradient-green px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-green-200"
            >
              <Plus className="h-5 w-5" />
              Viết bài mới
            </Link>
          )}
        </div>

        {data.featuredPosts && data.featuredPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="mb-4 flex items-center gap-2 font-display font-bold text-xl text-dblue">
              <span className="h-2 w-2 rounded-full bg-pgreen"></span>
              Bài viết nổi bật
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {data.featuredPosts.map((post: BlogPostResponse) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

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

        <Suspense fallback={<BlogGridSkeleton />}>
          {data.posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.posts.map((post: BlogPostResponse) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <h3 className="mb-2 font-display text-2xl font-semibold text-dblue">
                Chưa có bài viết nào
              </h3>
              <p className="mx-auto mb-6 max-w-md text-gray-600">
                Hãy quay lại sau để đọc những câu chuyện từ cộng đồng gây quỹ
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

        {data.total > data.limit && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(data.total / data.limit) }, (_, i) => i + 1).map(
              (page) => (
                <a
                  key={page}
                  href={`/blog?page=${page}${params.type ? `&type=${params.type}` : ''}`}
                  className={`rounded-full px-4 py-2 font-medium transition-colors ${
                    page === data.page
                      ? 'bg-pgreen text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
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
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-pgreen text-white'
          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </a>
  );
}

function BlogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="h-48 w-full animate-pulse bg-gray-200" />
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
