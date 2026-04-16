"use client";

import { Search, Filter } from "lucide-react";

interface ProjectEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function ProjectEmptyState({ hasFilters, onClearFilters }: ProjectEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        {hasFilters ? (
          <Filter className="text-gray-400" size={32} />
        ) : (
          <Search className="text-gray-400" size={32} />
        )}
      </div>
      
      <h3 className="text-2xl font-black text-gray-900 mb-2">
        Không tìm thấy dự án phù hợp
      </h3>
      
      <p className="text-gray-500 text-center max-w-md mb-6">
        {hasFilters
          ? "Không có dự án nào khớp với bộ lọc của bạn. Hãy thử điều chỉnh hoặc xóa bớt bộ lọc."
          : "Không có dự án nào khớp với từ khóa tìm kiếm. Hãy thử từ khóa khác."}
      </p>

      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );
}
