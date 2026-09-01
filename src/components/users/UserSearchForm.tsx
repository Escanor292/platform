"use client";

import { useState } from "react";
import { Loader2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
}

function roleLabel(role: string) {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "Quản trị";
    case "CREATOR":
      return "Creator";
    case "BACKER":
      return "Backer";
    default:
      return role;
  }
}

function roleBadgeClass(role: string) {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "bg-tblue/10 text-tblue";
    case "CREATOR":
      return "bg-pgreen/10 text-pgreen";
    default:
      return "bg-cream text-dblue";
  }
}

export default function UserSearchForm() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsLoading(true);
    setSearched(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
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

  return (
    <div className="mx-auto w-full max-w-3xl text-left">
      <form onSubmit={handleSearch} className="glass rounded-3xl p-4 shadow-soft sm:p-5">
        <label htmlFor="user-search" className="sr-only">
          Tìm theo tên, email hoặc ID
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="user-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tên hiển thị, email hoặc ID..."
              autoComplete="off"
              className="h-12 w-full rounded-2xl border border-white/70 bg-white/80 pl-12 pr-4 text-base text-dblue outline-none transition placeholder:text-gray-400 focus:border-pgreen/40 focus:ring-2 focus:ring-pgreen/20"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pgreen to-fgreen px-7 font-bold text-white transition hover:shadow-lg hover:shadow-green-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang tìm
              </>
            ) : (
              "Tìm kiếm"
            )}
          </button>
        </div>
      </form>

      {searched && (
        <div className="mt-6 rounded-3xl bg-white/80 p-5 shadow-soft backdrop-blur sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-xl text-dblue">Kết quả</h2>
              <p className="text-sm text-gray-500">
                {results.length > 0
                  ? `${results.length} người dùng phù hợp`
                  : "Chưa có kết quả phù hợp"}
              </p>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-pgreen/10 bg-cream/60 p-4 transition hover:-translate-y-0.5 hover:border-pgreen/25 hover:bg-white hover:shadow-soft"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pgreen to-fgreen font-display text-lg font-bold text-white shadow-sm">
                    {user.image ? (
                      <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                    ) : (
                      user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-dblue transition group-hover:text-pgreen">
                      {user.name || "Người dùng ẩn danh"}
                    </div>
                    <div className="truncate text-sm text-gray-500">{user.email}</div>
                  </div>
                  <span className={`hidden rounded-full px-3 py-1 text-xs font-bold sm:inline ${roleBadgeClass(user.role)}`}>
                    {roleLabel(user.role)}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-pgreen" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-pgreen/20 bg-cream/50 px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <Search className="h-6 w-6 text-pgreen" />
              </div>
              <h3 className="font-display font-bold text-dblue">Không tìm thấy người phù hợp</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Thử tên hiển thị, email hoặc mã người dùng khác.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
