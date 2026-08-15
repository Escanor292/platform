// ============================================================
// BLOG TYPES - TypeScript Definitions
// ============================================================

import { ObjectId } from 'mongodb';

// ============================================================
// MongoDB Content Types
// ============================================================
export interface BlogContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'video' | 'code' | 'quote' | 'list' | 'embed';
  data: Record<string, any>;
}

export interface BlogMedia {
  type: 'image' | 'video' | 'file';
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface BlogTableOfContents {
  id: string;
  text: string;
  level: number;
}

export interface BlogContent {
  _id?: ObjectId;
  postId: string; // UUID from PostgreSQL blog_posts
  format: 'markdown' | 'html' | 'rich_json';
  content?: string; // Markdown or HTML content
  richContent?: {
    blocks: BlogContentBlock[];
  };
  tableOfContents?: BlogTableOfContents[];
  media?: BlogMedia[];
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogDraft {
  _id?: ObjectId;
  postId: string;
  authorId: string;
  titleSnapshot?: string;
  excerptSnapshot?: string;
  contentSnapshot?: string;
  richContentSnapshot?: {
    blocks: BlogContentBlock[];
  };
  autosavedAt: Date;
}

export interface BlogVersion {
  _id?: ObjectId;
  postId: string;
  versionNumber: number;
  authorId: string;
  titleSnapshot?: string;
  excerptSnapshot?: string;
  contentSnapshot?: string;
  richContentSnapshot?: {
    blocks: BlogContentBlock[];
  };
  changeNote?: string;
  createdAt: Date;
}

export interface BlogViewLog {
  _id?: ObjectId;
  postId: string;
  userId?: string; // Nullable for anonymous
  ip?: string;
  userAgent?: string;
  viewedAt: Date;
}

// ============================================================
// API Request/Response Types
// ============================================================
export interface CreateBlogPostRequest {
  title: string;
  excerpt?: string;
  content?: string;
  richContent?: {
    blocks: BlogContentBlock[];
  };
  coverImage?: string;
  type: 'PLATFORM' | 'CAMPAIGN_UPDATE' | 'ANNOUNCEMENT' | 'STORY' | 'IMPACT_REPORT';
  campaignId?: string;
  visibility: 'PUBLIC' | 'BACKERS_ONLY' | 'OWNER_ONLY' | 'PRIVATE';
  categoryIds?: string[];
  tags?: string[];
  status?: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED';
}

export interface UpdateBlogPostRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  richContent?: {
    blocks: BlogContentBlock[];
  };
  coverImage?: string;
  type?: 'PLATFORM' | 'CAMPAIGN_UPDATE' | 'ANNOUNCEMENT' | 'STORY' | 'IMPACT_REPORT';
  visibility?: 'PUBLIC' | 'BACKERS_ONLY' | 'OWNER_ONLY' | 'PRIVATE';
  categoryIds?: string[];
  tags?: string[];
}

export interface BlogPostListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  type?: string;
  campaignId?: string;
  projectId?: string; // Filter by project ID or 'null'/'standalone' for platform blogs
  featured?: boolean;
  sort?: 'latest' | 'popular' | 'most_viewed';
  authorId?: string;
  status?: string;
}

export interface BlogPostResponse {
  id: string;
  authorId: string;
  campaignId?: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  status: string;
  type: string;
  visibility: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isFeatured: boolean;
  wordCount: number;
  readingTimeMinutes: number;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  campaign?: {
    id: string;
    title: string;
    slug: string;
  };
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  content?: string;
  richContent?: {
    blocks: BlogContentBlock[];
  };
  tableOfContents?: BlogTableOfContents[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

export interface BlogCommentResponse {
  id: string;
  postId: string;
  userId: string;
  parentId?: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  replies?: BlogCommentResponse[];
}

export interface ReportBlogRequest {
  reason: 'SPAM' | 'ABUSE' | 'MISINFORMATION' | 'SCAM' | 'INAPPROPRIATE' | 'OTHER';
  description?: string;
}
