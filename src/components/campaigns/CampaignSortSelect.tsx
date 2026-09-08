"use client";

import { SortOption } from "@/types/campaign";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CampaignSortSelectProps {
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

export function CampaignSortSelect({ value, onChange }: CampaignSortSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = sortOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-[100] overflow-visible" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border-2 border-pgreen/20 bg-white pl-12 pr-10 text-sm font-medium text-dblue transition-all hover:border-pgreen/40 focus:border-pgreen focus:outline-none focus:ring-2 focus:ring-pgreen/20"
      >
        <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        <span className="flex-1 text-left">{selectedOption?.label}</span>
        <ChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[999] mt-2 max-h-72 w-max min-w-full overflow-y-auto rounded-2xl border border-pgreen/20 bg-white shadow-2xl">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${option.value === value
                ? "bg-pgreen text-white"
                : "text-dblue hover:bg-pgreen/10 hover:text-pgreen"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
