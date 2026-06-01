"use client";

import { X } from "lucide-react";
import { ProjectFilters } from "@/types/project";
import { getActiveFilters } from "@/lib/project-filters";

interface ProjectFilterChipsProps {
  filters: ProjectFilters;
  onRemoveFilter: (key: keyof ProjectFilters) => void;
  onClearAll: () => void;
}

export function ProjectFilterChips({ filters, onRemoveFilter, onClearAll }: ProjectFilterChipsProps) {
  const activeFilters = getActiveFilters(filters);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-500">Đang lọc:</span>

      {activeFilters.map((filter) => (
        <button
          key={`${filter.key}-${filter.value}`}
          onClick={() => onRemoveFilter(filter.key)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-pgreen/10 text-pgreen rounded-full text-sm font-medium hover:bg-pgreen/20 transition-colors group"
        >
          <span>{filter.label}</span>
          <X size={14} className="group-hover:text-pgreen" />
        </button>
      ))}

      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm font-medium text-dblue hover:text-pgreen underline"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  );
}
