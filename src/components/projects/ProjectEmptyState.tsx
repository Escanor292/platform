"use client";

import { Search, Filter } from "lucide-react";

interface ProjectEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function ProjectEmptyState({ hasFilters, onClearFilters }: ProjectEmptyStateProps) {
  return (
    <div className="glass rounded-3xl py-16 px-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        {hasFilters ? (
          <Filter className="text-gray-400" size={32} />
        ) : (
          <Search className="text-gray-400" size={32} />
        )}
      </div>

      <h3 className="font-display text-xl font-bold text-dblue mb-2">
        Chưa tìm thấy dự án phù hợp
      </h3>

      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {hasFilters
          ? "Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để khám phá thêm các chiến dịch tử tế."
          : "Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để khám phá thêm các chiến dịch tử tế."}
      </p>

      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl gradient-green text-white font-bold hover:shadow-lg transition-all"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
