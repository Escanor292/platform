/**
 * Simple in-memory cache for project data
 */

import { ProjectListResponse } from "@/types/project";

interface CacheEntry {
  data: ProjectListResponse;
  timestamp: number;
}

class ProjectCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxAge: number = 5 * 60 * 1000; // 5 minutes

  get(key: string): ProjectListResponse | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: ProjectListResponse): void {
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

export const projectCache = new ProjectCache();

// Cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    projectCache.cleanup();
  }, 5 * 60 * 1000);
}
