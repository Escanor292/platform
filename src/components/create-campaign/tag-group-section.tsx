"use client";

import React, { useState } from "react";
import type { TagGroup, StarterTag } from "@/types/taxonomy";

interface TagGroupSectionProps {
  groupName: TagGroup;
  tags: StarterTag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  maxTags: number;
  initialShowCount?: number;
}

export function TagGroupSection({
  groupName,
  tags,
  selectedTags,
  onTagToggle,
  maxTags,
  initialShowCount = 6,
}: TagGroupSectionProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (tags.length === 0) return null;
  
  const displayedTags = showAll ? tags : tags.slice(0, initialShowCount);
  const hasMore = tags.length > initialShowCount;
  // Không giới hạn tags nữa
  const canSelectMore = true;
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">{groupName}</h4>
      
      <div className="flex flex-wrap gap-2">
        {displayedTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          const canSelect = canSelectMore || isSelected;
          
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => canSelect && onTagToggle(tag.id)}
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
              title={tag.description || tag.label}
            >
              {tag.label}
              {isSelected && (
                <span className="ml-1.5">×</span>
              )}
            </button>
          );
        })}
        
        {hasMore && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Xem thêm ({tags.length - initialShowCount})
          </button>
        )}
        
        {hasMore && showAll && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Thu gọn
          </button>
        )}
      </div>
    </div>
  );
}
