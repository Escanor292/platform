'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ProductionEditor } from '@/components/editor/ProductionEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { isEditorialBlogType } from '@/lib/blog/blog-policy';

export default function BlogEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const campaignId = searchParams.get('campaignId');
  const slugParam = searchParams.get('slug');
  const isAdmin = !!(session?.user as any)?.isAdmin || (session?.user as any)?.role === 'ADMIN';

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    type: campaignId ? 'CAMPAIGN_UPDATE' : 'STORY',
    visibility: 'PUBLIC',
    categoryIds: [] as string[],
    tags: [] as string[],
    status: 'DRAFT',
    projectId: null as string | null,
    campaignId: undefined as string | undefined,
    scheduledAt: '',
    rejectionReason: '' as string | null,
  });
  const [currentSlug, setCurrentSlug] = useState<string | null>(slugParam);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(!!slugParam);
  const [categories, setCategories] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchCategories();
    fetchProjectsAndCampaigns();
  }, []);

  useEffect(() => {
    if (!slugParam) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/blog/posts/${slugParam}`);
        if (!res.ok) throw new Error('Không tải được bài viết');
        const post = await res.json();
        setCurrentSlug(post.slug);
        setFormData({
          title: post.title || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          coverImage: post.coverImage || '',
          type: post.type || 'STORY',
          visibility: post.visibility || 'PUBLIC',
          categoryIds: (post.categories || []).map((category: any) => category.id),
          tags: (post.tags || []).map((tag: any) => tag.name),
          status: post.status || 'DRAFT',
          projectId: post.projectId || null,
          campaignId: post.campaignId || undefined,
          scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
          rejectionReason: post.rejectionReason || '',
        });
      } catch (error: any) {
        toast.error(error.message || 'Không tải được bài viết');
      } finally {
        setLoadingPost(false);
      }
    };
    load();
  }, [slugParam]);

  const fetchProjectsAndCampaigns = async () => {
    try {
      const [projectsRes, rewardsRes] = await Promise.all([
        fetch('/api/projects?limit=100'),
        fetch('/api/rewards/my'),
      ]);
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.data || []);
      }
      if (rewardsRes.ok) {
        const data = await rewardsRes.json();
        const seen = new Set<string>();
        const items: any[] = [];
        const addCampaigns = (list: any[]) =>
          (list || []).forEach((p: any) =>
            (p.campaigns || []).forEach((c: any) => {
              if (!seen.has(c.id)) {
                seen.add(c.id);
                items.push({ ...c, projectTitle: p.title || p.name });
              }
            })
          );
        addCampaigns(data.campaigns || []);
        addCampaigns(data.projectsWithCampaigns || []);
        setCampaigns(items);
      }
    } catch (error) {
      console.error('Failed to fetch projects/campaigns:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/blog/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const payload = () => ({
    ...formData,
    campaignId: campaignId || formData.campaignId || undefined,
    projectId: formData.projectId || undefined,
    scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
  });

  const saveDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (currentSlug) {
        const res = await fetch(`/api/blog/posts/${currentSlug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload()),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Không lưu được bản nháp');
        }
        const post = await res.json();
        setCurrentSlug(post.slug);
        toast.success('Đã lưu bản nháp');
      } else {
        const res = await fetch('/api/blog/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload(), status: 'DRAFT' }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Không lưu được bản nháp');
        }
        const post = await res.json();
        setCurrentSlug(post.slug);
        setFormData((current) => ({ ...current, status: post.status }));
        toast.success('Đã lưu bản nháp');
        router.replace(`/blog/editor?slug=${post.slug}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const submitForReview = async () => {
    setLoading(true);
    try {
      let slug = currentSlug;
      if (!slug) {
        const res = await fetch('/api/blog/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload(), status: 'PUBLISHED' }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Không gửi được bài viết');
        }
        const post = await res.json();
        slug = post.slug;
        if (post.status === 'PENDING_REVIEW') {
          toast.success('Đã gửi bài vào hàng đợi duyệt');
        } else {
          toast.success('Bài viết đã được xuất bản');
        }
        router.push(post.status === 'PUBLISHED' ? `/blog/${post.slug}` : '/blog/my-posts');
        return;
      }

      const updateRes = await fetch(`/api/blog/posts/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      if (!updateRes.ok) {
        const error = await updateRes.json();
        throw new Error(error.error || 'Không lưu được bài viết');
      }
      const publishRes = await fetch(`/api/blog/posts/${slug}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: payload().scheduledAt }),
      });
      const publishData = await publishRes.json().catch(() => ({}));
      if (!publishRes.ok) throw new Error(publishData.error || 'Không xuất bản được');
      if (publishData.status === 'PENDING_REVIEW') {
        toast.success(formData.status === 'REJECTED' ? 'Đã gửi duyệt lại' : 'Đã gửi bài vào hàng đợi duyệt');
        router.push('/blog/my-posts');
      } else {
        toast.success('Bài viết đã được xuất bản');
        router.push(`/blog/${slug}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async () => {
    if (!currentSlug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/posts/${currentSlug}/withdraw`, { method: 'PATCH' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không rút được bài');
      setFormData((current) => ({ ...current, status: 'DRAFT' }));
      toast.success('Đã rút bài về bản nháp');
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const needsReview = !isAdmin && isEditorialBlogType(formData.type);
  const publishLabel = needsReview
    ? formData.status === 'REJECTED'
      ? 'Sửa và gửi duyệt lại'
      : 'Gửi duyệt'
    : 'Xuất bản';

  if (status === 'loading' || loadingPost) {
    return <div className="flex min-h-screen items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          {currentSlug ? 'Sửa bài viết' : campaignId ? 'Viết cập nhật chiến dịch' : 'Tạo bài viết mới'}
        </h1>

        {formData.status === 'REJECTED' && formData.rejectionReason && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Bài viết bị từ chối. Lý do: {formData.rejectionReason}. Hãy sửa nội dung rồi gửi duyệt lại.
          </div>
        )}
        {formData.status === 'PENDING_REVIEW' && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Bài đang chờ Admin duyệt. Bạn có thể sửa nội dung hoặc rút về bản nháp.
          </div>
        )}

        <form onSubmit={saveDraft} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề bài viết..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Dự án (không bắt buộc)</label>
              <select
                value={formData.projectId || ''}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value || null })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Không thuộc dự án nào</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Bài viết có thể độc lập, không thuộc bất kỳ dự án nào.</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Chiến dịch liên quan (không bắt buộc)</label>
              <select
                value={formData.campaignId || campaignId || ''}
                onChange={(e) => setFormData({ ...formData, campaignId: e.target.value || undefined })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Không thuộc chiến dịch nào</option>
                {campaigns.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.title}{c.projectTitle ? ` • ${c.projectTitle}` : (c.project?.title ? ` • ${c.project.title}` : '')}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Blog có thể liên kết với một chiến dịch để hiển thị cùng nhau.</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Tóm tắt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Tóm tắt ngắn gọn về bài viết..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <ProductionEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              config={{
                placeholder: 'Viết nội dung bài viết...',
                maxLength: 10000,
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Ảnh bìa</label>
            <ImageUpload
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
            />
            <p className="mt-1 text-xs text-gray-500">Chọn một tấm ảnh thật ấn tượng để thu hút người đọc.</p>
          </div>

          {!campaignId && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Loại bài viết</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                {isAdmin && (
                  <>
                    <option value="PLATFORM">Tin tức nền tảng</option>
                    <option value="ANNOUNCEMENT">Thông báo</option>
                  </>
                )}
                <option value="STORY">Câu chuyện cá nhân</option>
                <option value="IMPACT_REPORT">Báo cáo tác động</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Quyền xem</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="PUBLIC">Công khai</option>
              <option value="BACKERS_ONLY">Chỉ người ủng hộ</option>
              <option value="PRIVATE">Riêng tư</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Lịch xuất bản (không bắt buộc)</label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Tags (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                tags: e.target.value.split(',').map((t) => t.trim()).filter((t) => t),
              })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gray-600 px-6 py-3 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu nháp'}
            </button>
            <button
              type="button"
              onClick={submitForReview}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : publishLabel}
            </button>
            {formData.status === 'PENDING_REVIEW' && currentSlug && (
              <button
                type="button"
                onClick={withdraw}
                disabled={loading}
                className="rounded-lg border border-amber-300 bg-white px-6 py-3 text-amber-800 hover:bg-amber-50 disabled:opacity-50"
              >
                Rút khỏi hàng đợi
              </button>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
