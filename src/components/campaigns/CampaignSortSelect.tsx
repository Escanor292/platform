"use client";

import { SortOption } from "@/types/campaign";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 220 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = sortOptions.find((opt) => opt.value === value);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const place = () => {
      if (!dropdownRef.current) return;
      const rect = dropdownRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 220),
      });
    };
    if (!isOpen) return;
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      if ((event.target as HTMLElement)?.closest?.("[data-sort-menu]")) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-12 w-[168px] cursor-pointer items-center justify-between rounded-xl border-2 border-pgreen/20 bg-white pl-11 pr-3 text-sm font-medium text-dblue transition-all hover:border-pgreen/40 focus:border-pgreen focus:outline-none focus:ring-2 focus:ring-pgreen/20"
      >
        <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <span className="flex-1 truncate text-left">{selectedOption?.label}</span>
        <ChevronDown className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} size={18} />
      </button>

      {mounted && isOpen &&
        createPortal(
          <div
            data-sort-menu
            className="max-h-72 overflow-y-auto rounded-2xl border border-pgreen/20 bg-white shadow-2xl"
            style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          >
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                  option.value === value ? "bg-pgreen text-white" : "text-dblue hover:bg-pgreen/10 hover:text-pgreen"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
