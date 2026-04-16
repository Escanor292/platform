"use client";

import { SortOption } from "@/types/project";
import { ArrowUpDown } from "lucide-react";

interface ProjectSortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "most_viewed", label: "Nhiều lượt xem" },
  { value: "top_rated", label: "Đánh giá cao" },
  { value: "most_backed", label: "Nhiều người ủng hộ" },
  { value: "highest_progress", label: "Tiến độ cao" },
  { value: "ending_soon", label: "Sắp kết thúc" },
  { value: "recently_updated", label: "Mới cập nhật" },
  { value: "oldest", label: "Cũ nhất" },
];

export function ProjectSortSelect({ value, onChange }: ProjectSortSelectProps) {
  return (
    <div className="relative">
      <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="appearance-none h-12 pl-12 pr-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium text-sm bg-white cursor-pointer hover:border-gray-300"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
