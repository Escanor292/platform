"use client";

import React, { useState, useEffect } from "react";
import type { MainCategory, CampaignTaxonomySelection } from "@/types/taxonomy";
import { CategorySelector } from "./category-selector";
import { StarterTagsSelector } from "./starter-tags-selector";
import {
  validateTaxonomySelection,
  sanitizeSelectedTags,
  getInvalidTagsForNewCategory,
  getTagsByIds,
} from "@/lib/taxonomy-helpers";

export function CreateCampaignForm() {
  const [selection, setSelection] = useState<CampaignTaxonomySelection>({
    mainCategory: null,
    starterTags: [],
  });
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showCategoryChangeWarning, setShowCategoryChangeWarning] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<MainCategory | null>(null);
  
  // Validate on change
  useEffect(() => {
    const result = validateTaxonomySelection(selection);
    setValidationErrors(result.errors);
  }, [selection]);
  
  const handleCategoryChange = (newCategory: MainCategory) => {
    // If there are selected tags, check if they're valid for the new category
    if (selection.starterTags.length > 0) {
      const invalidTags = getInvalidTagsForNewCategory(
        selection.starterTags,
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
    setSelection({
      mainCategory: newCategory,
      starterTags: selection.starterTags,
    });
  };
  
  const handleConfirmCategoryChange = () => {
    if (!pendingCategory) return;
    
    // Sanitize tags for new category
    const sanitizedTags = sanitizeSelectedTags(
      selection.starterTags,
      pendingCategory
    );
    
    setSelection({
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
    setSelection({
      ...selection,
      starterTags: tags,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = validateTaxonomySelection(selection);
    
    if (!result.isValid) {
      setValidationErrors(result.errors);
      return;
    }
    
    // Submit form
    console.log("Campaign taxonomy:", selection);
    alert("Form submitted! Check console for data.");
  };
  
  const invalidTagsForPendingCategory = pendingCategory
    ? getInvalidTagsForNewCategory(selection.starterTags, pendingCategory)
    : [];
  
  const invalidTagObjects = getTagsByIds(invalidTagsForPendingCategory);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Category Change Warning Modal */}
      {showCategoryChangeWarning && pendingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Xác nhận thay đổi danh mục
            </h3>
            <p className="text-sm text-gray-600">
              Bạn đang thay đổi danh mục từ{" "}
              <span className="font-medium">{selection.mainCategory}</span> sang{" "}
              <span className="font-medium">{pendingCategory}</span>.
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
      
      {/* Main Category */}
      <CategorySelector
        selectedCategory={selection.mainCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      {/* Starter Tags */}
      <StarterTagsSelector
        mainCategory={selection.mainCategory}
        selectedTags={selection.starterTags}
        onTagsChange={handleTagsChange}
      />
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Vui lòng kiểm tra lại:
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={validationErrors.length > 0}
          className={`
            px-6 py-3 rounded-lg text-sm font-medium
            ${
              validationErrors.length > 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }
          `}
        >
          Tiếp tục
        </button>
      </div>
      
      {/* Debug Info (remove in production) */}
      <details className="p-4 bg-gray-50 rounded-lg text-xs">
        <summary className="cursor-pointer font-medium text-gray-700">
          Debug Info
        </summary>
        <pre className="mt-2 overflow-auto">
          {JSON.stringify(selection, null, 2)}
        </pre>
      </details>
    </form>
  );
}
