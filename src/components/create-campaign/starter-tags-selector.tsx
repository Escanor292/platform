"use client";

import React, { useState, useMemo } from "react";
import type { MainCategory } from "@/types/taxonomy";
import {
  getTagGroupsWithTags,
  getRecommendedStarterTags,
  searchTagsInCategory,
  getTagsByIds,
} from "@/lib/taxonomy-helpers";
import { TagGroupSection } from "./tag-group-section";

interface StarterTagsSelectorProps {
  mainCategory: MainCategory | null;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function StarterTagsSelector({
  mainCategory,
  selectedTags,
  onTagsChange,
}: StarterTagsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecommended, setShowRecommended] = useState(true);
  
  const tagGroupsWithTags = useMemo(
    () => getTagGroupsWithTags(mainCategory),
    [mainCategory]
  );
  
  const recommendedTags = useMemo(
    () => getRecommendedStarterTags(mainCategory),
    [mainCategory]
  );
  
  const searchResults = useMemo(
    () => searchTagsInCategory(searchQuery, mainCategory),
    [searchQuery, mainCategory]
  );
  
  const selectedTagObjects = useMemo(
    () => getTagsByIds(selectedTags),
    [selectedTags]
  );
  
  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else {
      // Không giới hạn số lượng tags
      onTagsChange([...selectedTags, tagId]);
    }
  };
  
  const handleClearAll = () => {
    onTagsChange([]);
  };
  
  if (!mainCategory) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Thẻ phụ
        </label>
        <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">
            Vui lòng chọn danh mục chính trước để xem các thẻ phụ phù hợp
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Thẻ phụ
        </label>
        <span className="text-sm text-gray-500">
          Đã chọn: {selectedTags.length}
        </span>
      </div>
      
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Thẻ đã chọn:
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Xóa tất cả
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTagObjects.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white"
              >
                {tag.label}
                <button
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className="ml-1.5 hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm thẻ..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Kết quả tìm kiếm ({searchResults.length})
          </h4>
          {searchResults.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {searchResults.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                const canSelect = true; // Không giới hạn
                
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => canSelect && handleTagToggle(tag.id)}
                    disabled={!canSelect}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium
                      transition-all duration-200
                      ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : canSelect
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-gray-50 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    {tag.label}
                    {isSelected && <span className="ml-1.5">×</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Không tìm thấy thẻ phù hợp</p>
          )}
        </div>
      )}
      
      {/* Recommended Tags */}
      {!searchQuery && showRecommended && recommendedTags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Thẻ đề xuất</h4>
            <button
              type="button"
              onClick={() => setShowRecommended(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Ẩn
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              const canSelect = true; // Không giới hạn
              
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => canSelect && handleTagToggle(tag.id)}
                  disabled={!canSelect}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all duration-200
                    ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : canSelect
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  {tag.label}
                  {isSelected && <span className="ml-1.5">×</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {!searchQuery && !showRecommended && (
        <button
          type="button"
          onClick={() => setShowRecommended(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Hiện thẻ đề xuất
        </button>
      )}
      
      {/* Tag Groups */}
      {!searchQuery && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            Tất cả thẻ theo nhóm
          </h3>
          {Object.entries(tagGroupsWithTags).map(([groupName, tags]) => (
            <TagGroupSection
              key={groupName}
              groupName={groupName as any}
              tags={tags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              maxTags={999} // Không giới hạn
            />
          ))}
        </div>
      )}
    </div>
  );
}
