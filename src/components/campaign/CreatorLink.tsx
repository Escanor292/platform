"use client";

import { useRouter } from "next/navigation";

interface CreatorLinkProps {
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string | null;
}

export default function CreatorLink({ creatorId, creatorName, creatorAvatar }: CreatorLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${creatorId}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="flex items-center gap-2 hover:opacity-70 transition cursor-pointer"
    >
      <div className="w-7 h-7 rounded-full bg-pgreen/10 flex items-center justify-center text-pgreen text-xs font-bold">
        {creatorName?.charAt(0) || "C"}
      </div>
      <span className="text-xs font-semibold text-gray-600">
        {creatorName || "Anonymous"}
      </span>
    </div>
  );
}
