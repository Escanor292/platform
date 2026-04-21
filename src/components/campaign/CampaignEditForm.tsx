"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultipleImageUpload } from "@/components/shared/MultipleImageUpload";
import { DateInput } from "@/components/shared/DateInput";
import { ProductionEditor } from "@/components/editor";
import { EDITOR_PLACEHOLDERS } from "@/lib/editor/constants";
import { toast } from "sonner";
import { Save, Target, AlignLeft, Image as ImageIcon, Calendar, Tags, X } from "lucide-react";
import { CategorySelector } from "@/components/create-campaign/category-selector";
import { StarterTagsSelector } from "@/components/create-campaign/starter-tags-selector";
import type { MainCategory } from "@/types/taxonomy";
import { MAIN_CATEGORIES } from "@/types/taxonomy";
import { validateTaxonomySelection, sanitizeSelectedTags, getInvalidTagsForNewCategory, getTagsByIds } from "@/lib/taxonomy-helpers";
import Link from "next/link";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  minAmount: number;
  maxQuantity: number | null;
  deliveryDate: Date | null;
  isActive: boolean;
}

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string | null;
  imageUrl: string | null;
  images: string[];
  videoUrl: string | null;
  category: string;
  goalAmount: number;
  endDate: Date | null;
  rewards: Reward[];
}

interface CampaignEditFormProps {
  campaign: Campaign;
}

export default function CampaignEditForm({ campaign }: CampaignEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: campaign.title,
    tagline: campaign.description,
    description: campaign.longDescription || "",
    goalAmount: campaign.goalAmount,
    mainCategory: (campaign.category && MAIN_CATEGORIES.includes(campaign.category as any))
      ? (campaign.category as MainCategory)
      : null,
    starterTags: ((campaign as any).tags || []) as string[], // Load tags from campaign
    imageUrl: campaign.imageUrl || "",
    images: Array.isArray(campaign.images) ? campaign.images : [],
    endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : "",
  });

  console.log("[CampaignEditForm] Initial data:", {
    campaignCategory: campaign.category,
    isValidCategory: campaign.category && MAIN_CATEGORIES.includes(campaign.category as any),
    mainCategory: formData.mainCategory,
    imageUrl: campaign.imageUrl,
    images: campaign.images,
    formDataImages: Array.isArray(campaign.images) ? campaign.images : []
  });

  const [showCategoryChangeWarning, setShowCategoryChangeWarning] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<MainCategory | null>(null);

  const [displayAmount, setDisplayAmount] = useState(
    Number(campaign.goalAmount).toLocaleString("de-DE")
  );

  const formatVNDInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    return Number(numericValue).toLocaleString("de-DE");
  };

  const handleCategoryChange = (newCategory: MainCategory) => {
    // If there are selected tags, check if they're valid for the new category
    if (formData.starterTags.length > 0) {
      const invalidTags = getInvalidTagsForNewCategory(
        formData.starterTags,
        newCategory
      );

      if (invalidTags.length > 0) {
        // Show warning
        setPendingCategory(newCategory);
        setShowCategoryChangeWarning(true);
        return;
      }
    }

    // No conflicts, change category directly
    setFormData({
      ...formData,
      mainCategory: newCategory,
    });
  };

  const handleConfirmCategoryChange = () => {
    if (!pendingCategory) return;

    // Sanitize tags for new category
    const sanitizedTags = sanitizeSelectedTags(
      formData.starterTags,
      pendingCategory
    );

    setFormData({
      ...formData,
      mainCategory: pendingCategory,
      starterTags: sanitizedTags,
    });

    setShowCategoryChangeWarning(false);
    setPendingCategory(null);
  };

  const handleCancelCategoryChange = () => {
    setShowCategoryChangeWarning(false);
    setPendingCategory(null);
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData({
      ...formData,
      starterTags: tags,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatVNDInput(rawValue);
    const numeric = Number(rawValue.replace(/\D/g, ""));

    setDisplayAmount(formatted);
    setFormData({ ...formData, goalAmount: numeric });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate taxonomy
    const taxonomyValidation = validateTaxonomySelection({
      mainCategory: formData.mainCategory,
      starterTags: formData.starterTags,
    });

    if (!taxonomyValidation.isValid) {
      toast.error(taxonomyValidation.errors[0]);
      return;
    }

    // Validate required fields with specific messages
    const missingFields: string[] = [];
    if (!formData.title) missingFields.push("Tên dự án");
    if (!formData.tagline) missingFields.push("Mô tả ngắn");
    if (!formData.description) missingFields.push("Nội dung chi tiết");
    if (!formData.imageUrl) missingFields.push("Ảnh bìa");
    if (!formData.goalAmount || formData.goalAmount <= 0) missingFields.push("Số vốn mục tiêu");
    if (!formData.endDate) missingFields.push("Hạn chót chiến dịch");

    if (missingFields.length > 0) {
      toast.error(`Vui lòng điền: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    const promise = fetch(`/api/campaigns/${campaign.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Lỗi khi cập nhật dự án");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Đang cập nhật dự án...',
      success: () => {
        router.push("/dashboard/creator");
        router.refresh();
        return '✅ Cập nhật dự án thành công!';
      },
      error: (err) => err.message,
    });

    promise.finally(() => setLoading(false));
  };

  const invalidTagsForPendingCategory = pendingCategory
    ? getInvalidTagsForNewCategory(formData.starterTags, pendingCategory)
    : [];

  const invalidTagObjects = getTagsByIds(invalidTagsForPendingCategory);

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Category Change Warning Modal */}
        {showCategoryChangeWarning && pendingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Xác nhận thay đổi danh mục
              </h3>
              <p className="text-sm text-gray-600">
                Bạn đang thay đổi danh mục từ{" "}
                <span className="font-semibold">{formData.mainCategory}</span> sang{" "}
                <span className="font-semibold">{pendingCategory}</span>.
              </p>
              <p className="text-sm text-gray-600">
                Các thẻ sau sẽ bị xóa vì không phù hợp với danh mục mới:
              </p>
              <div className="flex flex-wrap gap-2 p-3 bg-red-50 rounded-lg">
                {invalidTagObjects.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelCategoryChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCategoryChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Block 1: Thông tin cơ bản */}
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlignLeft size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Thông tin cơ bản</h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 flex justify-between">
                <span>Tên dự án <span className="text-red-500">*</span></span>
                <span className="text-gray-400 font-normal">Tối đa 60 ký tự</span>
              </label>
              <Input
                required
                className="text-lg py-6 focus-ring rounded-xl bg-slate-50 border-gray-200"
                placeholder="Ví dụ: Năng lượng xanh cho bản vùng cao..."
                value={formData.title}
                maxLength={60}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Mô tả ngắn (Tagline) <span className="text-red-500">*</span>
              </label>
              <Input
                required
                className="py-5 focus-ring rounded-xl bg-slate-50 border-gray-200"
                placeholder="Câu tóm tắt ngắn gọn và cuốn hút nhất về dự án của bạn..."
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Block 2: Nội dung & Hình ảnh */}
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Câu chuyện & Media</h2>
              <p className="text-sm text-gray-500 font-medium">Một câu chuyện hay cùng hình ảnh đẹp sẽ thu hút nhiều sự chú ý hơn.</p>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Ảnh chiến dịch <span className="text-red-500">*</span>
              </label>
              <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-gray-300">
                <MultipleImageUpload
                  label="Tải ảnh lên (Tỉ lệ khuyến nghị 16:9)"
                  images={formData.images}
                  onChange={(images) => {
                    console.log("[EditCampaign] Images updated:", images);
                    setFormData(prev => ({ ...prev, images }));
                  }}
                  mainImage={formData.imageUrl}
                  onMainImageChange={(url) => {
                    console.log("[EditCampaign] Main image updated:", url);
                    setFormData(prev => ({ ...prev, imageUrl: url }));
                  }}
                  maxImages={10}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Nội dung chi tiết <span className="text-red-500">*</span>
              </label>
              <ProductionEditor
                content={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                config={{
                  placeholder: EDITOR_PLACEHOLDERS.CAMPAIGN_DESCRIPTION,
                  autosave: false,
                  enableBubbleMenu: true,
                }}
              />
            </div>
          </div>
        </div>

        {/* Block 3: Mục tiêu & Thời gian */}
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Mục tiêu & Lịch trình</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Số vốn mục tiêu (VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
                <Input
                  type="text"
                  className="pl-10 text-lg font-black text-gray-900 py-6 focus-ring rounded-xl bg-slate-50 border-gray-200"
                  required
                  placeholder="1.000.000"
                  value={displayAmount}
                  onChange={handleAmountChange}
                />
              </div>
              <p className="text-xs text-gray-500 font-medium">Đặt mục tiêu có thể đạt được để tạo động lực cho cộng đồng.</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Hạn chót chiến dịch <span className="text-red-500">*</span>
              </label>
              <DateInput
                value={formData.endDate}
                onChange={(value) => setFormData({ ...formData, endDate: value })}
                placeholder="dd/mm/yyyy"
                required
                min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày quá khứ
              />
              <p className="text-xs text-gray-500 font-medium">Thời gian tối đa thường là 30 - 60 ngày.</p>
            </div>
          </div>
        </div>

        {/* Block 4: Phân loại & Tags */}
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Tags size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phân loại dự án</h2>
              <p className="text-sm text-gray-500 font-medium">Giúp người ủng hộ dễ dàng tìm thấy dự án của bạn</p>
            </div>
          </div>

          <div className="space-y-8">
            <CategorySelector
              selectedCategory={formData.mainCategory}
              onCategoryChange={handleCategoryChange}
            />

            <div className="border-t border-gray-100 pt-8">
              <StarterTagsSelector
                mainCategory={formData.mainCategory}
                selectedTags={formData.starterTags}
                onTagsChange={handleTagsChange}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`
                flex-1 btn-primary px-12 py-5 text-lg shadow-[0_8px_30px_rgb(37,99,235,0.3)]
                ${loading ? "opacity-70 cursor-not-allowed" : ""}
             `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang cập nhật...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save size={20} />
                Lưu thay đổi
              </span>
            )}
          </button>
          <Link
            href="/dashboard/creator"
            className="px-8 py-5 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <X size={20} />
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
