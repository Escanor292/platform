// scripts/init-mongodb.js
// Khởi tạo tất cả collections, indexes và TTL cho kiến trúc Hybrid MongoDB
const { MongoClient } = require('mongodb');
require('dotenv').config();

const TTL_90_DAYS  = 90  * 24 * 60 * 60; //  7,776,000 seconds
const TTL_180_DAYS = 180 * 24 * 60 * 60; // 15,552,000 seconds
const TTL_365_DAYS = 365 * 24 * 60 * 60; // 31,536,000 seconds

/**
 * Xóa index theo tên nếu tồn tại (để tránh conflict khi re-run)
 */
async function dropIndexSafe(collection, indexName) {
  try {
    await collection.dropIndex(indexName);
    console.log(`   ↻ Dropped old index: ${indexName}`);
  } catch (_) {
    // Index chưa tồn tại — bỏ qua
  }
}


async function initMongo() {
  const uri    = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'crowdfunding_vn';

  if (!uri) {
    console.error('❌ MONGODB_URI is missing in .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    const db = client.db(dbName);

    // ─────────────────────────────────────────────
    // 1. activity_logs — TTL 90 ngày
    // ─────────────────────────────────────────────
    console.log('📁 [1/8] Creating indexes for activity_logs...');
    const logs = db.collection('activity_logs');
    // Drop conflicting old indexes trước (re-run safe)
    await dropIndexSafe(logs, 'createdAt_-1');
    await dropIndexSafe(logs, 'ttl_90_days');
    await logs.createIndex({ userId: 1 });
    await logs.createIndex({ action: 1 });
    await logs.createIndex({ entityType: 1, entityId: 1 });
    await logs.createIndex({ createdAt: -1 });
    await logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: TTL_90_DAYS, name: 'ttl_90_days' });
    console.log('   ✓ activity_logs done');

    // ─────────────────────────────────────────────
    // 2. audit_logs — TTL 365 ngày
    // ─────────────────────────────────────────────
    console.log('📁 [2/8] Creating indexes for audit_logs...');
    const auditLogs = db.collection('audit_logs');
    await auditLogs.createIndex({ entityType: 1, entityId: 1, createdAt: -1 });
    await auditLogs.createIndex({ userId: 1, createdAt: -1 });
    await auditLogs.createIndex({ action: 1, createdAt: -1 });
    await auditLogs.createIndex({ pgAuditLogId: 1 }, { sparse: true });
    await auditLogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: TTL_365_DAYS, name: 'ttl_365_days' });
    console.log('   ✓ audit_logs done');

    // ─────────────────────────────────────────────
    // 3. analytics_events — TTL 180 ngày
    // ─────────────────────────────────────────────
    console.log('📁 [3/8] Creating indexes for analytics_events...');
    const analytics = db.collection('analytics_events');
    await dropIndexSafe(analytics, 'createdAt_-1');
    await dropIndexSafe(analytics, 'ttl_180_days');
    await analytics.createIndex({ eventName: 1 });
    await analytics.createIndex({ userId: 1 });
    await analytics.createIndex({ campaignId: 1 });
    await analytics.createIndex({ campaignId: 1, eventName: 1, createdAt: -1 });
    await analytics.createIndex({ createdAt: -1 });
    await analytics.createIndex({ createdAt: 1 }, { expireAfterSeconds: TTL_180_DAYS, name: 'ttl_180_days' });
    console.log('   ✓ analytics_events done');

    // ─────────────────────────────────────────────
    // 4. notifications — TTL 90 ngày
    // ─────────────────────────────────────────────
    console.log('📁 [4/8] Creating indexes for notifications...');
    const notifications = db.collection('notifications');
    await dropIndexSafe(notifications, 'createdAt_-1');
    await dropIndexSafe(notifications, 'ttl_90_days');
    await notifications.createIndex({ userId: 1, createdAt: -1 });
    await notifications.createIndex({ userId: 1, isRead: 1 });
    await notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: TTL_90_DAYS, name: 'ttl_90_days' });
    console.log('   ✓ notifications done');

    // ─────────────────────────────────────────────
    // 5. campaign_comments — không TTL (lưu dài hạn)
    // ─────────────────────────────────────────────
    console.log('📁 [5/8] Creating indexes for campaign_comments...');
    const comments = db.collection('campaign_comments');
    await dropIndexSafe(comments, 'campaignId_1_createdAt_-1');
    await dropIndexSafe(comments, 'parentId_1');
    await dropIndexSafe(comments, 'userId_1');
    await comments.createIndex({ campaignId: 1, createdAt: -1 });
    await comments.createIndex({ campaignId: 1, parentId: 1, createdAt: 1 });
    await comments.createIndex({ parentId: 1, createdAt: 1 });
    await comments.createIndex({ userId: 1, createdAt: -1 });
    await comments.createIndex({ status: 1 });
    console.log('   ✓ campaign_comments done');

    // ─────────────────────────────────────────────
    // 6. campaign_updates — không TTL
    // ─────────────────────────────────────────────
    console.log('📁 [6/8] Creating indexes for campaign_updates...');
    const updates = db.collection('campaign_updates');
    await updates.createIndex({ campaignId: 1, status: 1, publishedAt: -1 });
    await updates.createIndex({ creatorId: 1 });
    await updates.createIndex({ campaignId: 1, isPinned: -1, publishedAt: -1 });
    await updates.createIndex({ tags: 1 });
    console.log('   ✓ campaign_updates done');

    // ─────────────────────────────────────────────
    // 7. campaign_contents — không TTL
    // ─────────────────────────────────────────────
    console.log('📁 [7/8] Creating indexes for campaign_contents...');
    const contents = db.collection('campaign_contents');
    await dropIndexSafe(contents, 'campaignId_1_isDraft_1');
    await contents.createIndex({ campaignId: 1, isDraft: 1 }, { unique: true });
    await contents.createIndex({ lastSavedBy: 1 });
    console.log('   ✓ campaign_contents done');

    // ─────────────────────────────────────────────
    // 8. user_metadata — không TTL
    // ─────────────────────────────────────────────
    console.log('📁 [8/8] Creating indexes for user_metadata...');
    const userMeta = db.collection('user_metadata');
    await userMeta.createIndex({ userId: 1 }, { unique: true });
    await userMeta.createIndex({ tags: 1 });
    console.log('   ✓ user_metadata done');

    // ─────────────────────────────────────────────
    // Verification
    // ─────────────────────────────────────────────
    console.log('\n─────────────────────────────────────────');
    console.log('📊 VERIFICATION — Collection Index Summary');
    console.log('─────────────────────────────────────────');

    const collections = [
      'activity_logs',
      'audit_logs',
      'analytics_events',
      'notifications',
      'campaign_comments',
      'campaign_updates',
      'campaign_contents',
      'user_metadata',
    ];

    for (const colName of collections) {
      const indexes = await db.collection(colName).listIndexes().toArray();
      const ttlIndex = indexes.find(i => i.expireAfterSeconds);
      const ttlInfo  = ttlIndex ? ` | TTL: ${Math.round(ttlIndex.expireAfterSeconds / 86400)}d` : '';
      console.log(`  ${colName.padEnd(25)} ${indexes.length} indexes${ttlInfo}`);
    }

    console.log('\n✅ MongoDB initialization complete!');
    console.log(`   Database: ${dbName}`);
    console.log(`   Collections: ${collections.length}`);
  } catch (error) {
    console.error('❌ Error initializing MongoDB:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initMongo();
