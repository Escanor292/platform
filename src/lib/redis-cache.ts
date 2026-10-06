/**
 * Redis-backed cache helper cho Crowdfunding-VN
 *
 * API tương thích với CampaignCache cũ (get/set với TTL),
 * nhưng hoạt động server-side qua ioredis thay vì in-memory Map.
 *
 * Key namespace:
 *   cfvn:campaigns:<queryString>  — danh sách campaigns theo filter
 *   cfvn:stats:v2                 — platform statistics
 */

import { redisGet, redisSet, redisDel, redisDelByPrefix, redisSetNx } from "@/lib/redis";

/** TTL mặc định: 5 phút */
const DEFAULT_TTL_SECONDS = 300;

// ────────────────────────────────────────────────────────────
// Generic cache helpers
// ────────────────────────────────────────────────────────────

/**
 * Lấy dữ liệu đã cache và deserialize JSON.
 * Trả về null nếu miss hoặc parse lỗi.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redisGet(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn("[RedisCache] cacheGet parse lỗi:", (err as Error).message);
    return null;
  }
}

/**
 * Serialize và lưu dữ liệu vào Redis với TTL.
 */
export async function cacheSet<T>(
  key: string,
  data: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
  try {
    const serialized = JSON.stringify(data);
    await redisSet(key, serialized, ttlSeconds);
  } catch (err) {
    console.warn("[RedisCache] cacheSet serialize lỗi:", (err as Error).message);
  }
}

/**
 * Xóa một cache key.
 */
export async function cacheDel(key: string): Promise<void> {
  await redisDel(key);
}

/**
 * Invalidate toàn bộ key theo prefix.
 * Dùng sau khi có thay đổi dữ liệu (create/update/delete).
 */
export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  await redisDelByPrefix(prefix);
}

// ────────────────────────────────────────────────────────────
// Key builders (tập trung để dễ maintain)
// ────────────────────────────────────────────────────────────

/** Prefix cho tất cả cache campaigns */
export const CAMPAIGNS_CACHE_PREFIX = "cfvn:campaigns:";

/** Key cho cache stats */
export const STATS_CACHE_KEY = "cfvn:stats:v2";

/**
 * Tạo cache key cho campaigns theo query string.
 * Dùng query string thô từ URL làm phần suffix.
 */
export function buildCampaignsCacheKey(queryString: string): string {
  return CAMPAIGNS_CACHE_PREFIX + (queryString || "default");
}

/** TTL cộng một ít giây ngẫu nhiên để nhiều key không hết hạn cùng một nhịp. */
export function withTtlJitter(baseSeconds: number, spreadSeconds = 60): number {
  const spread = Math.max(0, Math.floor(spreadSeconds));
  return baseSeconds + Math.floor(Math.random() * (spread + 1));
}

/**
 * Một request giữ khóa Redis và nạp cache. Request khác chờ bản vừa nạp,
 * tránh nhiều cache miss cùng đập database.
 */
export async function cacheReadThrough<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const lockKey = key + ":lock";
  const gotLock = await redisSetNx(lockKey, "1", 15);
  if (!gotLock) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      const again = await cacheGet<T>(key);
      if (again !== null) return again;
    }
  }

  try {
    const fresh = await load();
    await cacheSet(key, fresh, withTtlJitter(ttlSeconds));
    return fresh;
  } finally {
    if (gotLock) await redisDel(lockKey);
  }
}
