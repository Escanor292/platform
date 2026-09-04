'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X, Loader2, ImagePlus, FileText, Tag, Lock } from 'lucide-react';
import { ProductionEditor } from '@/components/editor/ProductionEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';
import OwnerEditPanel from '@/components/OwnerEditPanel';

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string | null;
  coverImage?: string | null;
  type?: string;
  visibility?: string;
  status?: string;
  author?: { id: string; name: string; avatar?: string | null };
};

interface Props {
  post: BlogPost;
  isOwner: boolean;
  children: React.ReactNode;
}

/**
 * Client wrapper cho trang blog chi tiết.
 * - Hiển thị OwnerEditPanel "Chỉnh sửa nhanh" ở góc cho tác giả.
 * - Khi bấm "Sửa ngay", mở dialog form sửa bài viết ngay tại chỗ
 *   (gọi PATCH /api/blog/posts/[slug]), sau đó tự làm mới trang.
 */
export default function BlogDetailPageClient({ post, isOwner, children }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: post.title,
    excerpt: post.excerpt || '',
    content: post.content ?? '',
    coverImage: post.coverImage || '',
    type: post.type,
    visibility: post.visibility,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (!editing) return;
    fetch('/api/blog/categories')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(data || []))
      .catch(() => {});
  }, [editing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/posts/${post.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          coverImage: formData.coverImage || null,
          type: formData.type,
          visibility: formData.visibility,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Không thể cập nhật bài viết');
      }
      toast.success('Bài viết đã được cập nhật!');
      setEditing(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {children}

      {isOwner && (
        <OwnerEditPanel
          isOwner={isOwner}
          blocks={[
            {
              label: 'Bài viết',
              description: 'Tiêu đề, ảnh bìa, nội dung và quyền xem',
              onEdit: () => setEditing(true),
            },
          ]}
        />
      )}

      {/* Dialog sửa bài viết tại chỗ */}
      {isOwner && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Chỉnh sửa bài viết</h2>
                  <p className="text-xs text-gray-500">Cập nhật ngay trên trang bài viết</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable form */}
            <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Ảnh bìa */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ImagePlus className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Ảnh bìa bài viết
                    </label>
                  </div>
                  <ImageUpload
                    value={formData.coverImage || undefined}
                    onChange={(url) => setFormData({ ...formData, coverImage: url })}
                    className="h-40"
                    label="Bấm để tải ảnh bìa"
                  />
                </div>

                {/* Tiêu đề */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập tiêu đề bài viết..."
                  />
                </div>

                {/* Tóm tắt */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tóm tắt ngắn
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Mô tả ngắn gọn về bài viết..."
                  />
                </div>

                {/* Loại bài viết & quyền xem */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loại bài viết
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="STORY">Câu chuyện</option>
                      <option value="PLATFORM">Tin tức</option>
                      <option value="ANNOUNCEMENT">Thông báo</option>
                      <option value="CAMPAIGN_UPDATE">Cập nhật chiến dịch</option>
                      <option value="IMPACT_REPORT">Báo cáo tác động</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Lock className="w-3.5 h-3.5" />
                      Quyền xem
                    </label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="PUBLIC">Công khai</option>
                      <option value="BACKERS_ONLY">Chỉ người ủng hộ</option>
                      <option value="OWNER_ONLY">Chỉ người tạo</option>
                      <option value="PRIVATE">Riêng tư</option>
                    </select>
                  </div>
                </div>

                {/* Nội dung rich text */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Nội dung chi tiết
                    </label>
                  </div>
                  <ProductionEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {(formData.content?.length || 0) > 0
                      ? `${formData.content.length.toLocaleString('vi-VN')} ký tự`
                      : 'Chưa lưu'}
                  </div>
                </div>

                {/* Gợi ý tags (chỉ xem) */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Danh mục bài viết
                    </label>
                  </div>
                  {categories.length > 0 ? (
                    <p className="text-xs text-gray-500">
                      Quản lý danh mục tại trang bài viết của tôi. Bài viết này có thể chỉnh
                      danh mục trong trang quản lý.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">Không có danh mục nào.</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.title.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
