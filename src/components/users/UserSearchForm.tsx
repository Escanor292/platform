"use client";

import { useState } from "react";
import { Search, User, Mail, Hash } from "lucide-react";
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`/api/users/search?type=${searchType}&query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.users || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="space-y-4">
          {/* Search Type */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Tìm kiếm theo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSearchType("id")}
                className={`flex-1 px-4 py-2 rounded-xl font-bold transition ${
                  searchType === "id"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Hash size={16} className="inline mr-1" />
                ID
              </button>
              <button
                type="button"
                onClick={() => setSearchType("email")}
                className={`flex-1 px-4 py-2 rounded-xl font-bold transition ${
                  searchType === "email"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Mail size={16} className="inline mr-1" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setSearchType("name")}
                className={`flex-1 px-4 py-2 rounded-xl font-bold transition ${
                  searchType === "name"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <User size={16} className="inline mr-1" />
                Tên
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              {searchType === "id" && "Nhập ID người dùng"}
              {searchType === "email" && "Nhập email"}
              {searchType === "name" && "Nhập tên người dùng"}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchType === "id" ? "cmo0vy9pf0000et1in40h2kfw" :
                  searchType === "email" ? "user@example.com" :
                  "Tên người dùng"
                }
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang tìm kiếm..." : "Tìm kiếm"}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-black text-gray-900 mb-4">
            Kết quả tìm kiếm ({results.length})
          </h2>

          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {user.name || "Người dùng ẩn danh"}
                    </div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                    <div className="text-xs text-gray-400 font-mono mt-1">ID: {user.id}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-black ${
                    user.role === "ADMIN" ? "bg-red-100 text-red-600" :
                    user.role === "CREATOR" || user.role === "CREATOR_PRO" ? "bg-blue-100 text-blue-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {user.role}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400">Không tìm thấy người dùng nào</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
