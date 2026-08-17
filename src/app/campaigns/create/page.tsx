"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { MultipleImageUpload } from "@/components/shared/MultipleImageUpload";
import { DateInput } from "@/components/shared/DateInput";
import { ProductionEditor } from "@/components/editor";
import { EDITOR_PLACEHOLDERS } from "@/lib/editor/constants";
import { toast } from "sonner";
import { Rocket, Target, AlignLeft, Image as ImageIcon, Calendar, Tags, AlertCircle } from "lucide-react";
import { CategorySelector } from "@/components/create-campaign/category-selector";
import { StarterTagsSelector } from "@/components/create-campaign/starter-tags-selector";
import { BlogSelector } from "@/components/create-campaign/blog-selector";
import type { MainCategory } from "@/types/taxonomy";
import { validateTaxonomySelection, sanitizeSelectedTags, getInvalidTagsForNewCategory, getTagsByIds } from "@/lib/taxonomy-helpers";

export default function CreateCampaignPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    goalAmount: 1000000,
    mainCategory: null as MainCategory | null,
    starterTags: [] as string[],
    imageUrl: "",
    images: [] as string[], // Multiple images array
    endDate: "",
    linkedBlogIds: [] as string[], // Blog posts linked to campaign
  });

  const [showCategoryChangeWarning, setShowCategoryChangeWarning] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<MainCategory | null>(null);

  const [displayAmount, setDisplayAmount] = useState("1.000.000");

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      toast.error("Vui lòng đăng nhập để tạo chiến dịch");
      router.push("/auth/login?callbackUrl=/campaigns/create");
      return;
    }

    const user = session.user as any;
    const userRole = user?.role;
    const isAdmin = user?.isAdmin === true || userRole === "ADMIN";

    // Chỉ cho phép CREATOR và ADMIN tạo chiến dịch
    if (userRole !== "CREATOR" && !isAdmin) {
      toast.error("Bạn cần nâng cấp lên tài khoản Creator để tạo chiến dịch");
      router.push("/");
    }
  }, [session, status, router]);

  // Hiển thị loading khi đang kiểm tra session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Không hiển thị form nếu chưa đăng nhập hoặc không có quyền
  if (!session) {
    return null;
  }

  const user = session.user as any;
  const userRole = user?.role;
  const isAdmin = user?.isAdmin === true || userRole === "ADMIN";

  if (userRole !== "CREATOR" && !isAdmin) {
    return null;
  }

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
    if (!formData.title) missingFields.push("Tên chiến dịch");
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
    const promise = fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Lỗi khi tạo chiến dịch");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Đang khởi tạo chiến dịch...',
      success: (campaign) => {
        router.push(`/campaigns/${campaign.slug}`);
        return '🎉 Tạo chiến dịch thành công!';
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
    <main className="min-h-screen bg-gradient-to-b from-cream via-white to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-pgreen/10 blur-3xl" />
          <div className="absolute right-1/4 top-24 h-72 w-72 rounded-full bg-tblue/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-pgreen/10 text-pgreen shadow-soft">
            <Rocket className="h-9 w-9" />
          </div>

          <h1 className="font-display text-4xl font-black text-dblue md:text-5xl">
            Bắt đầu mạch cảm hứng mới
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
            Hãy chia sẻ câu chuyện của bạn với thế giới. Chúng tôi sẽ giúp bạn kết nối với cộng đồng để biến ý tưởng thành hiện thực hiện hữu.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-pgreen/10 px-5 py-2 text-sm font-bold text-pgreen">
            <span className="text-red-500">*</span>
            Các trường có dấu sao là bắt buộc
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-20">

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

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
          <section className="rounded-3xl border border-pgreen/10 bg-white/90 p-8 shadow-soft backdrop-blur">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pgreen/10 text-pgreen">
                <AlignLeft className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-dblue">
                  Thông tin cơ bản
                </h2>
                <p className="text-sm text-gray-500">
                  Những thông tin đầu tiên giúp cộng đồng hiểu chiến dịch của bạn.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue flex justify-between">
                  <span>Tên chiến dịch <span className="text-red-500">*</span></span>
                  <span className="text-xs font-medium text-gray-400">Tối đa 60 ký tự</span>
                </label>
                <Input
                  required
                  className="h-13 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-pgreen focus:outline-none focus:ring-4 focus:ring-pgreen/10 text-lg"
                  placeholder="Ví dụ: Năng lượng xanh cho bản vùng cao..."
                  value={formData.title}
                  maxLength={60}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue">
                  Mô tả ngắn (Tagline) <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-pgreen focus:outline-none focus:ring-4 focus:ring-pgreen/10"
                  placeholder="Câu tóm tắt ngắn gọn và cuốn hút nhất về chiến dịch của bạn..."
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Block 2: Nội dung & Hình ảnh */}
          <section className="rounded-3xl border border-pgreen/10 bg-white/90 p-8 shadow-soft backdrop-blur">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pgreen/10 text-pgreen">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-dblue">
                  Câu chuyện & Media
                </h2>
                <p className="text-sm text-gray-500">
                  Một câu chuyện hay cùng hình ảnh đẹp sẽ thu hút nhiều sự chú ý hơn.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue">
                  Ảnh chiến dịch <span className="text-red-500">*</span>
                </label>
                <div className="rounded-2xl border-dashed border-pgreen/30 bg-pgreen/5 p-6">
                  <MultipleImageUpload
                    label="Tải ảnh lên (Tỉ lệ khuyến nghị 16:9)"
                    images={formData.images}
                    onChange={(images) => {
                      console.log("[CreateCampaign] Images updated:", images);
                      setFormData(prev => ({ ...prev, images }));
                    }}
                    mainImage={formData.imageUrl}
                    onMainImageChange={(url) => {
                      console.log("[CreateCampaign] Main image updated:", url);
                      setFormData(prev => ({ ...prev, imageUrl: url }));
                    }}
                    maxImages={10}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue">
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
          </section>

          {/* Block 3: Mục tiêu & Thời gian */}
          <section className="rounded-3xl border border-pgreen/10 bg-white/90 p-8 shadow-soft backdrop-blur">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pgreen/10 text-pgreen">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-dblue">
                  Mục tiêu & Lịch trình
                </h2>
                <p className="text-sm text-gray-500">
                  Đặt mục tiêu thực tế và thời gian phù hợp cho chiến dịch.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue">
                  Số vốn mục tiêu (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
                  <Input
                    type="text"
                    className="h-13 w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-lg font-black text-gray-900 placeholder:text-gray-400 transition focus:border-pgreen focus:outline-none focus:ring-4 focus:ring-pgreen/10"
                    required
                    placeholder="1.000.000"
                    value={displayAmount}
                    onChange={handleAmountChange}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Đặt mục tiêu có thể đạt được để tạo động lực cho cộng đồng.</p>
              </div>

              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold text-dblue">
                  Hạn chót chiến dịch <span className="text-red-500">*</span>
                </label>
                <DateInput
                  value={formData.endDate}
                  onChange={(value) => setFormData({ ...formData, endDate: value })}
                  placeholder="dd/mm/yyyy"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="mt-2 text-xs text-gray-500">Thời gian tối đa thường là 30 - 60 ngày.</p>
              </div>
            </div>
          </section>

          {/* Block 4: Phân loại chiến dịch */}
          <section className="rounded-3xl border border-pgreen/10 bg-white/90 p-8 shadow-soft backdrop-blur">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pgreen/10 text-pgreen">
                <Tags className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-dblue">
                  Phân loại chiến dịch
                </h2>
                <p className="text-sm text-gray-500">
                  Giúp người ủng hộ dễ dàng tìm thấy chiến dịch của bạn.
                </p>
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

              <div className="border-t border-gray-100 pt-8">
                <BlogSelector
                  selectedBlogIds={formData.linkedBlogIds}
                  onBlogsChange={(blogIds) => setFormData({ ...formData, linkedBlogIds: blogIds })}
                />
              </div>
            </div>
          </section>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl gradient-green px-8 py-4 text-base font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200 disabled:cursor-not-allowed disabled:opacity-60 w-full md:w-auto"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo chiến dịch...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Khởi tạo chiến dịch ngay <Rocket size={20} className="ml-2" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
