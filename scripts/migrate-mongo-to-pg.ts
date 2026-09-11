#!/usr/bin/env ts-node
/**
 * Script migrate dữ liệu từ MongoDB sang PostgreSQL.
 *
 * Chạy dry-run (không ghi gì):
 *   DRY_RUN=1 npx ts-node --project tsconfig.json scripts/migrate-mongo-to-pg.ts
 *
 * Chạy thật:
 *   npx ts-node --project tsconfig.json scripts/migrate-mongo-to-pg.ts
 *
 * Idempotent: upsert theo key ổn định, chạy nhiều lần an toàn.
 * Log từng collection — kiểm tra kết quả trước khi xóa Mongo production.
 */

/* eslint-disable no-console */

const DRY_RUN = process.env.DRY_RUN === '1';
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'crowdfunding_vn';
const BATCH = 500; // upsert theo batch

async function main() {
    if (!MONGO_URI) {
        console.log(
            '[MIGRATE] MONGODB_URI không có — bỏ qua.\n' +
            '  Set MONGODB_URI trong .env rồi chạy lại nếu cần migrate data.'
        );
        process.exit(0);
    }

    // Dynamic import để tránh crash khi không có mongodb package
    let MongoClient: any;
    try {
        ({ MongoClient } = await import('mongodb'));
    } catch {
        console.error('[MIGRATE] Package "mongodb" chưa cài. Chạy: pnpm add mongodb');
        process.exit(1);
    }

    const { prisma } = await import('../src/lib/prisma');

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    console.log(`[MIGRATE] Kết nối MongoDB OK. DB="${DB_NAME}" DRY_RUN=${DRY_RUN}`);

    const totals: Record<string, number> = {};

    // ── 1. notifications ────────────────────────────────────────────────────
    await migrateCollection({
        label: 'notifications',
        cursor: db.collection('notifications').find({}),
        dryRun: DRY_RUN,
        transform: (doc: any) => ({
            id: String(doc._id),
            userId: doc.userId,
            type: doc.type ?? 'SYSTEM',
            title: doc.title ?? '',
            message: doc.message ?? '',
            payload: doc.payload ?? {},
            isRead: doc.isRead ?? false,
            readAt: doc.readAt ?? null,
            createdAt: doc.createdAt ?? new Date(),
            updatedAt: doc.updatedAt ?? doc.createdAt ?? new Date(),
        }),
        upsert: (data: any) =>
            (prisma.notifications as any).upsert({
                where: { id: data.id },
                create: data,
                update: {},
            }),
        totals,
    });

    // ── 2. activity_logs ────────────────────────────────────────────────────
    await migrateCollection({
        label: 'activity_logs',
        cursor: db.collection('activity_logs').find({}).limit(50_000),
        dryRun: DRY_RUN,
        transform: (doc: any) => ({
            id: String(doc._id),
            userId: doc.userId ?? null,
            action: doc.action ?? 'UNKNOWN',
            entityType: doc.entityType ?? 'UNKNOWN',
            entityId: doc.entityId ?? '',
            details: doc.details ?? null,
            metadata: doc.metadata ?? null,
            createdAt: doc.createdAt ?? new Date(),
        }),
        upsert: (data: any) =>
            (prisma.activity_logs_v2 as any).upsert({
                where: { id: data.id },
                create: data,
                update: {},
            }),
        totals,
    });

    // ── 3. campaign_comments ────────────────────────────────────────────────
    await migrateCollection({
        label: 'campaign_comments',
        cursor: db.collection('campaign_comments').find({}),
        dryRun: DRY_RUN,
        transform: (doc: any) => ({
            id: String(doc._id),
            campaignId: doc.campaignId,
            userId: doc.userId,
            userName: doc.userName ?? 'Người dùng',
            userAvatar: doc.userAvatar ?? null,
            content: doc.content ?? '',
            parentId: doc.parentId ? String(doc.parentId) : null,
            depth: doc.depth ?? 0,
            isEdited: doc.isEdited ?? false,
            isDeleted: doc.isDeleted ?? false,
            status: doc.status ?? 'APPROVED',
            replyCount: doc.replyCount ?? 0,
            editHistory: doc.editHistory ?? [],
            createdAt: doc.createdAt ?? new Date(),
            updatedAt: doc.updatedAt ?? doc.createdAt ?? new Date(),
        }),
        upsert: (data: any) =>
            (prisma.campaign_comments as any).upsert({
                where: { id: data.id },
                create: data,
                update: {},
            }),
        totals,
    });

    // ── 4. campaign_updates (chỉ PUBLISHED) ────────────────────────────────
    await migrateCollection({
        label: 'campaign_updates',
        cursor: db.collection('campaign_updates').find({ status: 'PUBLISHED' }),
        dryRun: DRY_RUN,
        transform: (doc: any) => ({
            id: String(doc._id),
            campaignId: doc.campaignId,
            title: doc.title ?? '',
            content: doc.content ?? '',
            imageUrl: null,
            isPinned: doc.isPinned ?? false,
            tags: doc.tags ?? [],
            createdAt: doc.publishedAt ?? doc.createdAt ?? new Date(),
            updatedAt: doc.updatedAt ?? doc.createdAt ?? new Date(),
        }),
        upsert: (data: any) =>
            (prisma.campaign_updates as any).upsert({
                where: { id: data.id },
                create: data,
                update: {},
            }),
        totals,
    });

    // ── 5. blog content → blog_posts.content ───────────────────────────────
    await migrateCollection({
        label: 'blog_contents',
        cursor: db.collection('blog_contents').find({}),
        dryRun: DRY_RUN,
        transform: (doc: any) => ({
            postId: doc.postId,
            content: doc.content
                ? doc.content
                : doc.richContent
                    ? JSON.stringify(doc.richContent)
                    : null,
            wordCount: doc.wordCount ?? 0,
            readingTimeMinutes: doc.readingTimeMinutes ?? 0,
        }),
        upsert: (data: any) =>
            prisma.blog_posts.updateMany({
                where: { id: data.postId, content: null },
                data: {
                    content: data.content,
                    wordCount: data.wordCount,
                    readingTimeMinutes: data.readingTimeMinutes,
                },
            }),
        totals,
    });

    // ── 6. blog_drafts ──────────────────────────────────────────────────────
    await migrateCollection({
        label: 'blog_drafts',
        cursor: db.collection('blog_drafts').find({}),
        dryRun: DRY_RUN,
        transform: (doc: any) => ({
            postId: doc.postId,
            authorId: doc.authorId,
            titleSnapshot: doc.titleSnapshot ?? null,
            excerptSnapshot: doc.excerptSnapshot ?? null,
            contentSnapshot: doc.contentSnapshot ?? null,
            richContentSnapshot: doc.richContentSnapshot ?? null,
            autosavedAt: doc.autosavedAt ?? new Date(),
        }),
        upsert: (data: any) =>
            prisma.blog_drafts.upsert({
                where: { postId: data.postId },
                create: data,
                update: { autosavedAt: data.autosavedAt },
            }),
        totals,
    });

    await client.close();

    console.log('\n[MIGRATE] ✅ Kết quả:');
    let grand = 0;
    for (const [k, v] of Object.entries(totals)) {
        console.log(`  ${k.padEnd(22)} : ${v}`);
        grand += v;
    }
    console.log(`  ${'TỔNG'.padEnd(22)} : ${grand}`);
    if (DRY_RUN) console.log('\n  ⚠️  DRY_RUN=1 — không ghi gì vào PostgreSQL.');
}

// ── Helper ───────────────────────────────────────────────────────────────────

async function migrateCollection(opts: {
    label: string;
    cursor: any;
    dryRun: boolean;
    transform: (doc: any) => any;
    upsert: (data: any) => Promise<any>;
    totals: Record<string, number>;
}) {
    const { label, cursor, dryRun, transform, upsert, totals } = opts;
    totals[label] = 0;

    try {
        const docs: any[] = await cursor.toArray();
        console.log(`[MIGRATE] ${label}: ${docs.length} documents`);

        if (!dryRun) {
            // batch để tránh OOM
            for (let i = 0; i < docs.length; i += BATCH) {
                const batch = docs.slice(i, i + BATCH);
                await Promise.allSettled(
                    batch.map(async (doc) => {
                        try {
                            await upsert(transform(doc));
                            totals[label]++;
                        } catch {
                            // bỏ qua lỗi đơn lẻ (foreign key thiếu, trùng id…)
                        }
                    })
                );
                if (docs.length > BATCH) {
                    process.stdout.write(
                        `\r  → ${Math.min(i + BATCH, docs.length)}/${docs.length}    `
                    );
                }
            }
            if (docs.length > BATCH) process.stdout.write('\n');
        } else {
            totals[label] = docs.length; // dry-run: count only
        }
    } catch (err: any) {
        console.warn(`[MIGRATE] ${label} lỗi:`, err?.message || err);
    }
}

main().catch((e) => {
    console.error('[MIGRATE] Fatal:', e);
    process.exit(1);
});
