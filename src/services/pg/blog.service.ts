import { prisma } from '@/lib/prisma';
import type { BlogContentBlock } from '@/types/blog.types';

// ── Content (lưu vào cột blog_posts.content) ──────────────────────────────

export async function createBlogContent(data: {
    postId: string;
    format: string;
    content?: string;
    richContent?: { blocks: BlogContentBlock[] };
    wordCount: number;
    readingTimeMinutes: number;
}): Promise<string> {
    const stored =
        data.content ?? (data.richContent ? JSON.stringify(data.richContent) : null);
    await prisma.blog_posts.update({
        where: { id: data.postId },
        data: {
            content: stored,
            wordCount: data.wordCount,
            readingTimeMinutes: data.readingTimeMinutes,
        },
    });
    return data.postId;
}

export async function getBlogContent(postId: string) {
    const post = await prisma.blog_posts.findUnique({
        where: { id: postId },
        select: { content: true, wordCount: true, readingTimeMinutes: true },
    });
    if (!post) return null;
    let richContent: { blocks: BlogContentBlock[] } | undefined;
    if (post.content) {
        try {
            const parsed = JSON.parse(post.content);
            if (parsed?.blocks) richContent = parsed;
        } catch { }
    }
    return {
        postId,
        format: richContent ? 'rich_json' : 'markdown',
        content: post.content ?? undefined,
        richContent,
        wordCount: post.wordCount,
        readingTimeMinutes: post.readingTimeMinutes,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

export async function updateBlogContent(
    postId: string,
    data: {
        content?: string;
        richContent?: { blocks: BlogContentBlock[] };
        wordCount?: number;
        readingTimeMinutes?: number;
    }
): Promise<boolean> {
    const update: Record<string, unknown> = {};
    if (data.content !== undefined) update.content = data.content;
    if (data.richContent !== undefined) update.content = JSON.stringify(data.richContent);
    if (data.wordCount !== undefined) update.wordCount = data.wordCount;
    if (data.readingTimeMinutes !== undefined)
        update.readingTimeMinutes = data.readingTimeMinutes;

    await prisma.blog_posts.update({ where: { id: postId }, data: update });
    return true;
}

export async function deleteBlogContent(postId: string): Promise<boolean> {
    await prisma.blog_posts.update({ where: { id: postId }, data: { content: null } });
    return true;
}

// ── Drafts ────────────────────────────────────────────────────────────────

export async function saveDraft(data: {
    postId: string;
    authorId: string;
    titleSnapshot?: string;
    excerptSnapshot?: string;
    contentSnapshot?: string;
    richContentSnapshot?: { blocks: BlogContentBlock[] };
}): Promise<void> {
    await prisma.blog_drafts.upsert({
        where: { postId: data.postId },
        create: {
            postId: data.postId,
            authorId: data.authorId,
            titleSnapshot: data.titleSnapshot ?? null,
            excerptSnapshot: data.excerptSnapshot ?? null,
            contentSnapshot: data.contentSnapshot ?? null,
            richContentSnapshot: (data.richContentSnapshot ?? null) as any,
            autosavedAt: new Date(),
        },
        update: {
            titleSnapshot: data.titleSnapshot ?? null,
            excerptSnapshot: data.excerptSnapshot ?? null,
            contentSnapshot: data.contentSnapshot ?? null,
            richContentSnapshot: (data.richContentSnapshot ?? null) as any,
            autosavedAt: new Date(),
        },
    });
}

export async function getDraft(postId: string) {
    return prisma.blog_drafts.findUnique({ where: { postId } });
}

export async function deleteDraft(postId: string): Promise<void> {
    await prisma.blog_drafts.deleteMany({ where: { postId } });
}

// ── Versions ──────────────────────────────────────────────────────────────

export async function createVersion(data: {
    postId: string;
    authorId: string;
    titleSnapshot?: string;
    excerptSnapshot?: string;
    contentSnapshot?: string;
    richContentSnapshot?: { blocks: BlogContentBlock[] };
    changeNote?: string;
}): Promise<void> {
    const last = await prisma.blog_versions.findFirst({
        where: { postId: data.postId },
        orderBy: { versionNumber: 'desc' },
        select: { versionNumber: true },
    });
    const versionNumber = (last?.versionNumber ?? 0) + 1;
    await prisma.blog_versions.create({
        data: {
            postId: data.postId,
            versionNumber,
            authorId: data.authorId,
            titleSnapshot: data.titleSnapshot ?? null,
            excerptSnapshot: data.excerptSnapshot ?? null,
            contentSnapshot: data.contentSnapshot ?? null,
            richContentSnapshot: (data.richContentSnapshot ?? null) as any,
            changeNote: data.changeNote ?? null,
        },
    });
}

export async function getVersions(postId: string) {
    return prisma.blog_versions.findMany({
        where: { postId },
        orderBy: { versionNumber: 'desc' },
    });
}

export async function getVersion(postId: string, versionNumber: number) {
    return prisma.blog_versions.findUnique({
        where: { postId_versionNumber: { postId, versionNumber } },
    });
}

// ── View Logs ──────────────────────────────────────────────────────────────

export async function logView(data: {
    postId: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
}): Promise<void> {
    await prisma.blog_view_logs
        .create({ data: { ...data, viewedAt: new Date() } })
        .catch(() => { }); // fire-and-forget, không chặn request
}

export async function getViewCount(postId: string): Promise<number> {
    return prisma.blog_view_logs.count({ where: { postId } });
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function calculateWordCount(
    content?: string,
    richContent?: { blocks: BlogContentBlock[] }
): number {
    if (content) {
        return content.split(/\s+/).filter((w) => w.length > 0).length;
    }
    if (richContent?.blocks) {
        const text = richContent.blocks
            .filter((b) => ['paragraph', 'heading'].includes(b.type))
            .map((b) => b.data?.text || '')
            .join(' ');
        return text.split(/\s+/).filter((w) => w.length > 0).length;
    }
    return 0;
}

export function calculateReadingTime(wordCount: number): number {
    return Math.ceil(wordCount / 200);
}

/** no-op — Prisma manages indexes */
export async function initBlogIndexes(): Promise<void> { }
