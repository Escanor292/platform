/**
 * Redis singleton client — follow pattern của prisma.ts
 *
 * - Singleton qua globalForRedis để tránh tạo nhiều connection trong dev mode (HMR)
 * - ioredis tự nhận TLS từ URL scheme rediss:// — không cần config thêm
 * - Retry strategy: tối đa 3 lần, delay tăng dần, max 5000ms
 * - Graceful degradation: mọi helper đều try/catch, trả null khi lỗi, KHÔNG throw
 */

import Redis from "ioredis";

// ────────────────────────────────────────────────────────────
// Singleton setup (giống globalForPrisma)
// ────────────────────────────────────────────────────────────

const globalForRedis = global as unknown as { redis: Redis | undefined };

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL;

  if (!url) {
    console.warn("[Redis] REDIS_URL không được cấu hình. Cache Redis sẽ bị bỏ qua.");
    // Trả về null — mọi operation sẽ được bắt bởi helper
    return null as unknown as Redis;
  }

  const client = new Redis(url, {
    // ioredis tự xử lý TLS khi URL là rediss://
    // Retry strategy: 3 lần, delay tăng dần lên tối đa 5 giây
    retryStrategy(times: number) {
      if (times > 3) {
        console.warn("[Redis] Đã thử kết nối " + times + " lần, dừng retry.");
        return null; // Dừng retry
      }
      const delay = Math.min(times * 500, 5000);
      return delay;
    },
    // Tắt enableReadyCheck để tránh block app khi Redis chưa sẵn sàng
    enableReadyCheck: false,
    // Timeout kết nối
    connectTimeout: 5000,
    // Giới hạn retry mỗi request
    maxRetriesPerRequest: 1,
    // Kết nối ngay khi tạo instance
    lazyConnect: false,
  });

  client.on("connect", () => {
    console.log("[Redis] ✓ Đã kết nối Redis Cloud");
  });

  client.on("error", (err: Error) => {
    // Log warning nhưng KHÔNG throw — app tiếp tục chạy không có cache
    console.warn("[Redis] Lỗi kết nối:", err.message);
  });

  client.on("close", () => {
    console.warn("[Redis] Kết nối đã đóng");
  });

  return client;
}

export const redisClient: Redis =
  globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redisClient;
}

// ────────────────────────────────────────────────────────────
// Helper functions với graceful degradation
// ────────────────────────────────────────────────────────────

/**
 * Lấy giá trị từ Redis.
 * @returns Giá trị string hoặc null nếu miss / lỗi
 */
export async function redisGet(key: string): Promise<string | null> {
  try {
    if (!redisClient) return null;
    return await redisClient.get(key);
  } catch (err) {
    console.warn("[Redis] redisGet(\"" + key + "\") thất bại:", (err as Error).message);
    return null;
  }
}

/**
 * Lưu giá trị vào Redis với TTL (giây).
 * @param ttlSeconds TTL tính bằng giây (mặc định 300s = 5 phút)
 */
export async function redisSet(
  key: string,
  value: string,
  ttlSeconds: number = 300
): Promise<void> {
  try {
    if (!redisClient) return;
    await redisClient.set(key, value, "EX", ttlSeconds);
  } catch (err) {
    console.warn("[Redis] redisSet(\"" + key + "\") thất bại:", (err as Error).message);
  }
}

/**
 * Xóa một key khỏi Redis.
 */
export async function redisDel(key: string): Promise<void> {
  try {
    if (!redisClient) return;
    await redisClient.del(key);
  } catch (err) {
    console.warn("[Redis] redisDel(\"" + key + "\") thất bại:", (err as Error).message);
  }
}

/**
 * Xóa tất cả key theo prefix (SCAN để tránh block Redis).
 * Dùng khi cần invalidate nhóm cache (VD: sau khi write campaigns).
 */
export async function redisDelByPrefix(prefix: string): Promise<void> {
  try {
    if (!redisClient) return;

    // Dùng SCAN thay vì KEYS để không block Redis production
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redisClient.scan(
        cursor,
        "MATCH",
        prefix + "*",
        "COUNT",
        100
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== "0");
  } catch (err) {
    console.warn("[Redis] redisDelByPrefix(\"" + prefix + "\") thất bại:", (err as Error).message);
  }
}

/**
 * Flush toàn bộ Redis DB — CHỈ dùng trong development/testing.
 */
export async function redisFlushAll(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    console.warn("[Redis] redisFlushAll() bị chặn trong môi trường production.");
    return;
  }
  try {
    if (!redisClient) return;
    await redisClient.flushall();
    console.log("[Redis] Đã flush toàn bộ cache.");
  } catch (err) {
    console.warn("[Redis] redisFlushAll() thất bại:", (err as Error).message);
  }
}

export default redisClient;
