"use client";

import Link from "next/link";

interface BackerLinkProps {
  userId?: string | null;
  userName?: string | null;
  displayName?: string | null;
  isAnonymous: boolean;
  userAvatar?: string | null;
}

export default function BackerLink({ 
  userId, 
  userName, 
  displayName, 
  isAnonymous,
  userAvatar 
}: BackerLinkProps) {
  const name = isAnonymous 
    ? "Người ủng hộ ẩn danh" 
    : (userName || displayName || "Người ủng hộ");
  
  const initial = isAnonymous 
    ? "🎭" 
    : (userName?.slice(0, 1) || displayName?.slice(0, 1) || "?");

  // Nếu ẩn danh hoặc không có userId, không có link
  if (isAnonymous || !userId) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
          {initial}
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-900">{name}</div>
        </div>
      </div>
    );
  }

  // Có userId, tạo link
  return (
    <Link 
      href={`/profile/${userId}`}
      className="flex items-center gap-4 hover:opacity-70 transition cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
        {initial}
      </div>
      <div className="flex-1">
        <div className="font-bold text-gray-900 hover:text-purple-600 transition">{name}</div>
      </div>
    </Link>
  );
}
