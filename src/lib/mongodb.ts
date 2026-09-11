/**
 * MongoDB client — DEPRECATED.
 * Đã migrate toàn bộ sang PostgreSQL/Prisma (Neon).
 * App không còn cần MONGODB_URI để boot.
 *
 * File này chỉ còn để script migrate-mongo-to-pg.ts có thể
 * import khi MONGODB_URI được set tường minh.
 */

let _warnedOnce = false;

function warnOnce() {
  if (!_warnedOnce) {
    console.warn(
      '[MONGODB] getDb() được gọi nhưng MongoDB đã bị gỡ khỏi app. ' +
      'Nếu đang chạy script migrate, set MONGODB_URI trong .env.'
    );
    _warnedOnce = true;
  }
}

export async function getDb(): Promise<never> {
  warnOnce();
  throw new Error(
    'MongoDB đã bị gỡ. Caller cần chuyển sang PostgreSQL/Prisma. ' +
    'Xem src/services/pg/ để dùng service tương đương.'
  );
}

export function getMongoClient(): Promise<never> {
  return getDb();
}

export async function closeConnection(): Promise<void> {
  // no-op
}

export default { connect: () => Promise.resolve() } as any;
