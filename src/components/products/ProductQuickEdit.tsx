'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X, Loader2, Package, Tag, Calendar } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import OwnerEditPanel from '@/components/OwnerEditPanel';

export interface QuickEditProduct {
  id: string;
  title: string;
  description?: string | null;
  minAmount: number | string;
  maxAmount?: number | string | null;
  stock?: number | null;
  maxQuantity?: number | null;
  deliveryDate?: Date | string | null;
  isPreorder?: boolean;
  isActive: boolean;
  isIncludedInProject?: boolean;
  productImages?: string[];
  productVideo?: string | null;
}

interface ProductQuickEditProps {
  product: QuickEditProduct;
  /** Chỉ hiện panel khi là chủ sở hữu (chủ dự án/chủ chiến dịch) */
  isOwner: boolean;
}

/**
 * Dialog chỉnh sửa nhanh sản phẩm — sửa ngay tại trang chi tiết sản phẩm
 * mà không cần chuyển sang trang quản lý.
 */
export function ProductQuickEdit({ product, isOwner }: ProductQuickEditProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description || '',
    minAmount: String(Number(product.minAmount) || ''),
    maxAmount: product.maxAmount !== null && product.maxAmount !== undefined ? String(Number(product.maxAmount)) : '',
    stock: product.stock ? String(product.stock) : '',
    maxQuantity: product.maxQuantity ? String(product.maxQuantity) : '',
    deliveryDate: product.deliveryDate
      ? new Date(product.deliveryDate).toISOString().slice(0, 10)
      : '',
    isPreorder: product.isPreorder === true,
    isActive: product.isActive,
    images: product.productImages || [],
    videoUrl: product.productVideo || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.isPreorder && !formData.deliveryDate) {
      toast.error('Vui lòng chọn ngày dự kiến giao hàng cho sản phẩm đặt trước');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/rewards/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          minAmount: formData.minAmount,
          maxAmount: formData.maxAmount || null,
          stock: formData.stock || null,
          maxQuantity: formData.maxQuantity || null,
          deliveryDate: formData.isPreorder ? (formData.deliveryDate || null) : null,
          isPreorder: formData.isPreorder,
          isActive: formData.isActive,
          productImages: formData.images,
          productVideo: formData.videoUrl || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Không thể cập nhật sản phẩm');
      }
      toast.success('Sản phẩm đã được cập nhật!');
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
      {/* Panel chỉnh sửa nhanh */}
      <OwnerEditPanel
        isOwner={isOwner}
        blocks={[
          {
            label: 'Thông tin sản phẩm',
            description: 'Tên, giá, tồn kho, ảnh, trạng thái',
            onEdit: () => setEditing(true),
          },
        ]}
      />

      {/* Dialog sửa sản phẩm tại chỗ */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Package className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Chỉnh sửa sản phẩm</h2>
                  <p className="text-xs text-gray-500">Cập nhật ngay trên trang sản phẩm</p>
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
                {/* Tên sản phẩm */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                    placeholder="Ví dụ: Bộ hạt giống cây xanh tử tế"
                  />
                </div>

                {/* Mô tả */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm resize-y"
                    placeholder="Mô tả chi tiết sản phẩm..."
                  />
                </div>

                {/* Giá */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                      Giá sản phẩm (đ) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                      placeholder="55000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                      Giá gốc gạch đi (đ, tùy chọn)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                      placeholder="Để trống nếu không có"
                    />
                  </div>
                </div>

                {/* Tồn kho & số lượng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                      Số lượng tồn kho
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                      Số lượng tối đa mỗi đơn
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxQuantity}
                      onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* Đặt hàng trước */}
                <div className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition ${formData.isPreorder ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${formData.isPreorder ? 'text-amber-700' : 'text-gray-500'}`} />
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Cho phép đặt hàng trước</div>
                      <div className="text-xs text-gray-500">Nhận đơn trước và giao vào ngày dự kiến</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.isPreorder}
                    aria-label="Cho phép đặt hàng trước"
                    onClick={() => setFormData({ ...formData, isPreorder: !formData.isPreorder, deliveryDate: formData.isPreorder ? '' : formData.deliveryDate })}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${formData.isPreorder ? 'bg-amber-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${formData.isPreorder ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {formData.isPreorder && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      Ngày dự kiến giao hàng *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                    />
                  </div>
                )}

                {/* Ảnh sản phẩm */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                    Ảnh sản phẩm
                  </label>
                  <div className="space-y-3">
                    {formData.images.length > 0 ? (
                      formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <ImageUpload
                            label={idx === 0 ? 'Ảnh chính' : `Ảnh ${idx + 1}`}
                            value={img}
                            onChange={(url) => {
                              const next = [...formData.images];
                              next[idx] = url;
                              setFormData({ ...formData, images: next });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                images: formData.images.filter((_, i) => i !== idx),
                              })
                            }
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <ImageUpload
                        label="Thêm ảnh sản phẩm"
                        value={undefined}
                        onChange={(url) => setFormData({ ...formData, images: [url] })}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                    >
                      + Thêm ảnh
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Ảnh đầu tiên là ảnh chính hiển thị lớn nhất.
                  </p>
                </div>

                {/* Trạng thái */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <input
                    id="qa-active"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="qa-active" className="text-sm font-medium text-gray-700">
                    Sản phẩm đang hoạt động (hiển thị công khai)
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
