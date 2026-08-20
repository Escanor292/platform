import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is missing in .env');
}

const uri    = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'crowdfunding_vn';

const options = {
  connectTimeoutMS:      10000,
  socketTimeoutMS:       45000,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize:           10, // Connection pool
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // Dev: giữ connection qua HMR reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production: module-level singleton đủ dùng
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Lấy database instance.
 *
 * FIX #1: Không cache dbInstance ở module scope.
 * MongoClient đã có connection pooling nội bộ — gọi .db() nhiều lần
 * là O(1) và luôn dùng connection đang sống.
 * Cache module-scope nguy hiểm vì nếu connection ngắt và reconnect,
 * dbInstance cũ trỏ vào DB object đã chết → mọi query fail vĩnh viễn.
 */
export async function getDb(): Promise<Db> {
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
  } catch (error) {
    console.error('[MONGODB] Failed to connect:', error);
    throw error;
  }
}

/** Lấy raw MongoClient (hiếm khi cần) */
export function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

/** Đóng kết nối thủ công (chỉ dùng trong scripts, không dùng trong app) */
export async function closeConnection(): Promise<void> {
  if (client) await client.close();
}

export default clientPromise;
