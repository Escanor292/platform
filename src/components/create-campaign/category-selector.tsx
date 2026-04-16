"use client";

import React from "react";
import type { MainCategory } from "@/types/taxonomy";
import { TAXONOMY_DATA } from "@/data/taxonomy";

interface CategorySelectorProps {
  selectedCategory: MainCategory | null;
  onCategoryChange: (category: MainCategory) => void;
  disabled?: boolean;
}

export function CategorySelector({
  selectedCategory,
  onCategoryChange,
  disabled = false,
}: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Danh mục chính <span className="text-red-500">*</span>
      </label>
      <p className="text-sm text-gray-500">
        Chọn 1 danh mục phù hợp nhất với chiến dịch của bạn
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {TAXONOMY_DATA.mainCategories.map((category) => {
          const isSelected = selectedCategory === category;
          
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              disabled={disabled}
              className={`
                px-4 py-3 rounded-lg border-2 text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
