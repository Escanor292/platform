"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ProjectSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function ProjectSearchBar({ value, onChange, onClear }: ProjectSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(localValue.trim());
  };

  const handleClear = () => {
    setLocalValue("");
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="Tìm theo mã dự án (CF-...) hoặc tên dự án"
          className="w-full h-16 pl-16 pr-16 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>
    </form>
  );
}
