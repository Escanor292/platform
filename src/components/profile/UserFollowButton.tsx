"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function UserFollowButton({
  userId,
  initialIsFollowing = false,
  initialFollowersCount = 0,
  className,
}: {
  userId: string;
  initialIsFollowing?: boolean;
  initialFollowersCount?: number;
  className?: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(initialIsFollowing);
  const [count, setCount] = useState(initialFollowersCount);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    if (!session?.user) {
      toast.error("Đăng nhập để theo dõi");
      router.push("/auth/login");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: following ? "DELETE" : "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không lưu được");
      setFollowing(Boolean(data.isFollowing));
      if (typeof data.followersCount === "number") setCount(data.followersCount);
      toast.success(data.isFollowing ? "Đã theo dõi" : "Đã bỏ theo dõi");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-60",
        following
          ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          : "bg-gradient-to-r from-pgreen to-fgreen text-white hover:shadow-lg",
        className,
      )}
    >
      {saving ? (
        <Loader2 size={16} className="animate-spin" />
      ) : following ? (
        <UserCheck size={16} />
      ) : (
        <UserPlus size={16} />
      )}
      {following ? "Đang theo dõi" : "Theo dõi"}
      <span className="text-xs font-semibold opacity-80">{count}</span>
    </button>
  );
}
