"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function BlogSearchForm({
  defaultSearch = "",
  type,
}: {
  defaultSearch?: string;
  type?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultSearch);

  const hrefFor = (search: string) => {
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (type) query.set("type", type);
    const qs = query.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    router.push(hrefFor(value));
  };

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Tìm bài viết theo tiêu đề hoặc mô tả..."
        className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-24 text-sm text-gray-800 outline-none ring-pgreen/20 placeholder:text-gray-400 focus:border-pgreen focus:ring-4"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            router.push(hrefFor(""));
          }}
          className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Xóa tìm kiếm"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-xl bg-pgreen px-3 text-xs font-black text-white hover:bg-fgreen"
      >
        Tìm
      </button>
    </form>
  );
}
