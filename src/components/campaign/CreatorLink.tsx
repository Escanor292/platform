"use client";

import { useRouter } from "next/navigation";
import { UserBadgeList } from "@/components/badge/UserBadgeList";

interface CreatorLinkProps {
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string | null;
  showBadges?: boolean;
}

export default function CreatorLink({ creatorId, creatorName, creatorAvatar, showBadges = true }: CreatorLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${creatorId}`);
  };

  return (
    <div className="flex flex-col gap-1.5">
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
      {showBadges && (
        <div className="ml-9">
          <UserBadgeList userId={creatorId} compact maxDisplay={3} />
        </div>
      )}
    </div>
  );
}
