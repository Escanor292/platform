"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export function ChatNotificationBadge() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    loadUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [session, loadUnreadCount]);

  if (unreadCount === 0) return null;

  const displayCount = unreadCount > 99 ? "99+" : unreadCount.toString();

  return (
    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
      {displayCount}
    </span>
  );
}
