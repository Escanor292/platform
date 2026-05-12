// ============================================================
// BLOG MONGODB SERVICE - Content Storage
// ============================================================

import { getDb } from '@/lib/mongodb';
import {
  BlogContent,
  BlogDraft,
  BlogVersion,
  BlogViewLog,
  BlogContentBlock,
} from '@/types/blog.types';
import { ObjectId } from 'mongodb';

const COLLECTIONS = {
  CONTENTS: 'blog_contents',
  DRAFTS: 'blog_drafts',
  VERSIONS: 'blog_versions',
  VIEW_LOGS: 'blog_view_logs',
};

// ============================================================
// Blog Content Operations
// ============================================================

/**
 * Create blog content in MongoDB
 */
export async function createBlogContent(data: {
  postId: string;
  format: 'markdown' | 'html' | 'rich_json';
  content?: string;
  richContent?: { blocks: BlogContentBlock[] };
  wordCount: number;
  readingTimeMinutes: number;
}): Promise<string> {
  const db = await getDb();
  const collection = db.collection<BlogContent>(COLLECTIONS.CONTENTS);

  const blogContent: BlogContent = {
    postId: data.postId,
    format: data.format,
    content: data.content,
    richContent: data.richContent,
    tableOfContents: extractTableOfContents(data.richContent),
    media: extractMedia(data.richContent),
    wordCount: data.wordCount,
    readingTimeMinutes: data.readingTimeMinutes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(blogContent as any);
  return result.insertedId.toString();
}

/**
 * Get blog content by postId
 */
export async function getBlogContent(postId: string): Promise<BlogContent | null> {
  const db = await getDb();
  const collection = db.collection<BlogContent>(COLLECTIONS.CONTENTS);
  return await collection.findOne({ postId });
}

/**
 * Update blog content
 */
export async function updateBlogContent(
  postId: string,
  data: {
    content?: string;
    richContent?: { blocks: BlogContentBlock[] };
    wordCount?: number;
    readingTimeMinutes?: number;
  }
): Promise<boolean> {
  const db = await getDb();
  const collection = db.collection<BlogContent>(COLLECTIONS.CONTENTS);

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.content !== undefined) updateData.content = data.content;
  if (data.richContent !== undefined) {
    updateData.richContent = data.richContent;
    updateData.tableOfContents = extractTableOfContents(data.richContent);
    updateData.media = extractMedia(data.richContent);
  }
  if (data.wordCount !== undefined) updateData.wordCount = data.wordCount;
  if (data.readingTimeMinutes !== undefined) updateData.readingTimeMinutes = data.readingTimeMinutes;

  const result = await collection.updateOne(
    { postId },
    { $set: updateData }
  );

  return result.modifiedCount > 0;
}

/**
 * Delete blog content
 */
export async function deleteBlogContent(postId: string): Promise<boolean> {
  const db = await getDb();
  const collection = db.collection<BlogContent>(COLLECTIONS.CONTENTS);
  const result = await collection.deleteOne({ postId });
  return result.deletedCount > 0;
}

// ============================================================
// Draft Operations
// ============================================================

/**
 * Save draft autosave
 */
export async function saveDraft(data: {
  postId: string;
  authorId: string;
  titleSnapshot?: string;
  excerptSnapshot?: string;
  contentSnapshot?: string;
  richContentSnapshot?: { blocks: BlogContentBlock[] };
}): Promise<void> {
  const db = await getDb();
  const collection = db.collection<BlogDraft>(COLLECTIONS.DRAFTS);

  const draft: BlogDraft = {
    postId: data.postId,
    authorId: data.authorId,
    titleSnapshot: data.titleSnapshot,
    excerptSnapshot: data.excerptSnapshot,
    contentSnapshot: data.contentSnapshot,
    richContentSnapshot: data.richContentSnapshot,
    autosavedAt: new Date(),
  };

  await collection.updateOne(
    { postId: data.postId },
    { $set: draft },
    { upsert: true }
  );
}

/**
 * Get draft by postId
 */
export async function getDraft(postId: string): Promise<BlogDraft | null> {
  const db = await getDb();
  const collection = db.collection<BlogDraft>(COLLECTIONS.DRAFTS);
  return await collection.findOne({ postId });
}

/**
 * Delete draft
 */
export async function deleteDraft(postId: string): Promise<void> {
  const db = await getDb();
  const collection = db.collection<BlogDraft>(COLLECTIONS.DRAFTS);
  await collection.deleteOne({ postId });
}

// ============================================================
// Version History Operations
// ============================================================

/**
 * Create version snapshot
 */
export async function createVersion(data: {
  postId: string;
  authorId: string;
  titleSnapshot?: string;
  excerptSnapshot?: string;
  contentSnapshot?: string;
  richContentSnapshot?: { blocks: BlogContentBlock[] };
  changeNote?: string;
}): Promise<void> {
  const db = await getDb();
  const collection = db.collection<BlogVersion>(COLLECTIONS.VERSIONS);

  // Get next version number
  const lastVersion = await collection
    .find({ postId: data.postId })
    .sort({ versionNumber: -1 })
    .limit(1)
    .toArray();

  const versionNumber = lastVersion.length > 0 ? lastVersion[0].versionNumber + 1 : 1;

  const version: BlogVersion = {
    postId: data.postId,
    versionNumber,
    authorId: data.authorId,
    titleSnapshot: data.titleSnapshot,
    excerptSnapshot: data.excerptSnapshot,
    contentSnapshot: data.contentSnapshot,
    richContentSnapshot: data.richContentSnapshot,
    changeNote: data.changeNote,
    createdAt: new Date(),
  };

  await collection.insertOne(version as any);
}

/**
 * Get all versions for a post
 */
export async function getVersions(postId: string): Promise<BlogVersion[]> {
  const db = await getDb();
  const collection = db.collection<BlogVersion>(COLLECTIONS.VERSIONS);
  return await collection
    .find({ postId })
    .sort({ versionNumber: -1 })
    .toArray();
}

/**
 * Get specific version
 */
export async function getVersion(postId: string, versionNumber: number): Promise<BlogVersion | null> {
  const db = await getDb();
  const collection = db.collection<BlogVersion>(COLLECTIONS.VERSIONS);
  return await collection.findOne({ postId, versionNumber });
}

// ============================================================
// View Log Operations
// ============================================================

/**
 * Log a view
 */
export async function logView(data: {
  postId: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  const db = await getDb();
  const collection = db.collection<BlogViewLog>(COLLECTIONS.VIEW_LOGS);

  const viewLog: BlogViewLog = {
    postId: data.postId,
    userId: data.userId,
    ip: data.ip,
    userAgent: data.userAgent,
    viewedAt: new Date(),
  };

  await collection.insertOne(viewLog as any);
}

/**
 * Get view count for a post (from logs)
 */
export async function getViewCount(postId: string): Promise<number> {
  const db = await getDb();
  const collection = db.collection<BlogViewLog>(COLLECTIONS.VIEW_LOGS);
  return await collection.countDocuments({ postId });
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Extract table of contents from rich content
 */
function extractTableOfContents(richContent?: { blocks: BlogContentBlock[] }) {
  if (!richContent?.blocks) return [];

  return richContent.blocks
    .filter((block) => block.type === 'heading')
    .map((block) => ({
      id: block.id,
      text: block.data.text || '',
      level: block.data.level || 2,
    }));
}

/**
 * Extract media from rich content
 */
function extractMedia(richContent?: { blocks: BlogContentBlock[] }) {
  if (!richContent?.blocks) return [];

  return richContent.blocks
    .filter((block) => block.type === 'image' || block.type === 'video')
    .map((block) => ({
      type: block.type as 'image' | 'video',
      url: block.data.url || '',
      alt: block.data.alt,
      caption: block.data.caption,
      width: block.data.width,
      height: block.data.height,
    }));
}

/**
 * Calculate word count from content
 */
export function calculateWordCount(content?: string, richContent?: { blocks: BlogContentBlock[] }): number {
  if (content) {
    return content.split(/\s+/).filter((word) => word.length > 0).length;
  }

  if (richContent?.blocks) {
    const text = richContent.blocks
      .filter((block) => block.type === 'paragraph' || block.type === 'heading')
      .map((block) => block.data.text || '')
      .join(' ');
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  return 0;
}

/**
 * Calculate reading time (average 200 words per minute)
 */
export function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200);
}

// ============================================================
// Initialize Indexes
// ============================================================

/**
 * Create MongoDB indexes for blog collections
 */
export async function initBlogIndexes(): Promise<void> {
  const db = await getDb();

  // Blog contents indexes
  await db.collection(COLLECTIONS.CONTENTS).createIndex({ postId: 1 }, { unique: true });

  // Blog drafts indexes
  await db.collection(COLLECTIONS.DRAFTS).createIndex({ postId: 1 });
  await db.collection(COLLECTIONS.DRAFTS).createIndex({ authorId: 1 });

  // Blog versions indexes
  await db.collection(COLLECTIONS.VERSIONS).createIndex({ postId: 1, versionNumber: -1 });

  // Blog view logs indexes
  await db.collection(COLLECTIONS.VIEW_LOGS).createIndex({ postId: 1, viewedAt: -1 });
  await db.collection(COLLECTIONS.VIEW_LOGS).createIndex({ userId: 1 });

  console.log('[BLOG] MongoDB indexes created successfully');
}
