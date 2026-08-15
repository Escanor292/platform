/**
 * Simple in-memory cache for campaign data
 */

import { CampaignListResponse } from "@/types/campaign";

interface CacheEntry {
  data: CampaignListResponse;
  timestamp: number;
}

class CampaignCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxAge: number = 5 * 60 * 1000; // 5 minutes

  get(key: string): CampaignListResponse | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: CampaignListResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

export const campaignCache = new CampaignCache();

// Cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    campaignCache.cleanup();
  }, 5 * 60 * 1000);
}
