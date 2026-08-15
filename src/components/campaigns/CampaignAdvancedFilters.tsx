"use client";

import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { CampaignFilters, CampaignType, CampaignStatus, CompletionState, MainCategory } from "@/types/campaign";

interface CampaignAdvancedFiltersProps {
  filters: CampaignFilters;
  onApply: (filters: Partial<CampaignFilters>) => void;
  onClose: () => void;
}

const categories: MainCategory[] = [
  "Giáo dục", "Y tế", "Cộng đồng", "Công nghệ", "Nghệ thuật",
  "Môi trường", "Nông nghiệp", "Giải trí", "Kinh doanh", "Khẩn cấp & Từ thiện"
];

const campaignTypes: { value: CampaignType; label: string }[] = [
  { value: "REWARD", label: "Reward-based" },
  { value: "DONATION", label: "Donation-based" },
  { value: "EQUITY", label: "Equity-based" },
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "PREORDER", label: "Pre-order" },
];

const completionStates: { value: CompletionState; label: string }[] = [
  { value: "ONGOING", label: "Đang gây quỹ" },
  { value: "GOAL_REACHED", label: "Đã đạt mục tiêu" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "NOT_STARTED", label: "Chưa bắt đầu" },
  { value: "FAILED", label: "Đã kết thúc" },
  { value: "PAUSED", label: "Tạm dừng" },
];

const timeRanges = [
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "90d", label: "3 tháng qua" },
  { value: "365d", label: "1 năm qua" },
];

const progressRanges = [
  { min: 0, max: 25, label: "Dưới 25%" },
  { min: 25, max: 50, label: "25% - 50%" },
  { min: 50, max: 75, label: "50% - 75%" },
  { min: 75, max: 100, label: "75% - 100%" },
  { min: 100, max: undefined, label: "Đã đạt mục tiêu" },
];

export function CampaignAdvancedFilters({ filters, onApply, onClose }: CampaignAdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Partial<CampaignFilters>>({
    category: filters.category,
    campaignType: filters.campaignType,
    completionState: filters.completionState,
    ratingMin: filters.ratingMin,
    createdWithin: filters.createdWithin,
    progressMin: filters.progressMin,
    progressMax: filters.progressMax,
    isFeatured: filters.isFeatured,
  });

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dblue/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={24} className="text-pgreen" />
            <h2 className="font-display text-xl font-bold text-dblue">Bộ lọc nâng cao</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-pgreen/10 hover:text-pgreen flex items-center justify-center transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Category */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-dblue uppercase tracking-wider">
              Danh mục
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLocalFilters({ ...localFilters, category: localFilters.category === cat ? undefined : cat })}
                  className={`px-3 py-2 rounded-2xl text-sm font-medium transition-colors ${localFilters.category === cat
                    ? "bg-pgreen text-white shadow-lg"
                    : "bg-cream text-dblue hover:bg-pgreen/10 hover:text-pgreen"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Type */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-dblue uppercase tracking-wider">
              Loại chiến dịch
            </label>
            <div className="space-y-2">
              {campaignTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setLocalFilters({ ...localFilters, campaignType: localFilters.campaignType === type.value ? undefined : type.value })}
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-medium text-left transition-colors ${localFilters.campaignType === type.value
                    ? "bg-pgreen text-white"
                    : "bg-cream text-dblue hover:bg-pgreen/10"
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Completion State */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-dblue uppercase tracking-wider">
              Trạng thái
            </label>
            <div className="space-y-2">
              {completionStates.map((state) => (
                <button
                  key={state.value}
                  onClick={() => setLocalFilters({ ...localFilters, completionState: localFilters.completionState === state.value ? undefined : state.value })}
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-medium text-left transition-colors ${localFilters.completionState === state.value
                    ? "bg-pgreen text-white"
                    : "bg-cream text-dblue hover:bg-pgreen/10"
                    }`}
                >
                  {state.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-dblue uppercase tracking-wider">
              Đánh giá
            </label>
            <div className="space-y-2">
              {[5, 4, 3].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setLocalFilters({ ...localFilters, ratingMin: localFilters.ratingMin === rating ? undefined : rating })}
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-medium text-left transition-colors ${localFilters.ratingMin === rating
                    ? "bg-pgreen text-white"
                    : "bg-cream text-dblue hover:bg-pgreen/10"
                    }`}
                >
                  {rating}+ sao
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-dblue uppercase tracking-wider">
              Thời gian tạo
            </label>
            <div className="space-y-2">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setLocalFilters({ ...localFilters, createdWithin: localFilters.createdWithin === range.value ? undefined : range.value })}
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-medium text-left transition-colors ${localFilters.createdWithin === range.value
                    ? "bg-pgreen text-white"
                    : "bg-cream text-dblue hover:bg-pgreen/10"
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Range */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-dblue uppercase tracking-wider">
              Tiến độ gây quỹ
            </label>
            <div className="space-y-2">
              {progressRanges.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const isSelected = localFilters.progressMin === range.min && localFilters.progressMax === range.max;
                    setLocalFilters({
                      ...localFilters,
                      progressMin: isSelected ? undefined : range.min,
                      progressMax: isSelected ? undefined : range.max,
                    });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-medium text-left transition-colors ${localFilters.progressMin === range.min && localFilters.progressMax === range.max
                    ? "bg-pgreen text-white"
                    : "bg-cream text-dblue hover:bg-pgreen/10"
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.isFeatured || false}
                onChange={(e) => setLocalFilters({ ...localFilters, isFeatured: e.target.checked || undefined })}
                className="w-5 h-5 rounded border-gray-300 text-pgreen focus:ring-pgreen"
              />
              <span className="text-sm font-bold text-dblue uppercase tracking-wider">
                Chỉ chiến dịch nổi bật
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 h-12 rounded-xl border-2 border-pgreen/20 font-bold text-dblue hover:text-pgreen transition-colors"
          >
            Đặt lại
          </button>
          <button
            onClick={handleApply}
            className="flex-1 h-12 rounded-xl gradient-green font-bold text-white hover:shadow-lg transition-all"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
