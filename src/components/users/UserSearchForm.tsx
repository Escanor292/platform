"use client";

import { useState } from "react";
import { Search, User, Mail, Hash, Loader2 } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
}

export default function UserSearchForm() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"id" | "email" | "name">("id");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearched(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/search?type=${searchType}&query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Không thể tìm kiếm người dùng lúc này");
      }

      setResults(data.users || []);
    } catch (error) {
      console.error("Search error:", error);
      setError("Không thể tìm kiếm người dùng lúc này. Vui lòng thử lại sau.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getHelperText = () => {
    switch (searchType) {
      case "id":
        return "Nhập chính xác ID người dùng, ví dụ: cmph...";
      case "email":
        return "Nhập email người dùng cần tra cứu.";
      case "name":
        return "Nhập tên hoặc một phần tên hiển thị.";
      default:
        return "";
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case "id":
        return "Nhập ID người dùng...";
      case "email":
        return "Nhập email người dùng...";
      case "name":
        return "Nhập tên người dùng...";
      default:
        return "";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700";
      case "CREATOR":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-8 rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-sm backdrop-blur">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          Quản lý người dùng
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Tìm kiếm người dùng
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Tra cứu nhanh thông tin người dùng bằng ID, email hoặc tên hiển thị.
        </p>
      </div>

      {/* Search Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Search Type Tabs */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Phương thức tìm kiếm
            </label>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setSearchType("id")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition flex items-center justify-center gap-2 ${searchType === "id"
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Hash size={16} />
                # ID
              </button>
              <button
                type="button"
                onClick={() => setSearchType("email")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition flex items-center justify-center gap-2 ${searchType === "email"
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Mail size={16} />
                Email
              </button>
              <button
                type="button"
                onClick={() => setSearchType("name")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition flex items-center justify-center gap-2 ${searchType === "name"
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <User size={16} />
                Tên
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              {searchType === "id" && "Nhập ID người dùng"}
              {searchType === "email" && "Nhập email"}
              {searchType === "name" && "Nhập tên người dùng"}
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getPlaceholder()}
                className="h-12 w-full rounded-2xl border-slate-200 pl-11 pr-4 text-base focus:border-emerald-500 focus:ring-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">{getHelperText()}</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="h-12 w-full rounded-2xl bg-emerald-600 px-6 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang tìm...
              </>
            ) : (
              "Tìm kiếm"
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Kết quả tìm kiếm</h2>
              <p className="text-sm text-slate-500">
                {results.length > 0
                  ? `Tìm thấy ${results.length} người dùng`
                  : "Thông tin người dùng sẽ hiển thị tại đây."
                }
              </p>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 hover:bg-emerald-50/60 transition group"
                >
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                    {user.image ? (
                      <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                    ) : (
                      user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                      {user.name || "Người dùng ẩn danh"}
                    </div>
                    <div className="text-sm text-slate-600">{user.email}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">ID: {user.id}</div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Không tìm thấy người dùng phù hợp</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Hãy kiểm tra lại ID, email hoặc tên đã nhập.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
