// ============================================================
// BLOG COMMENT SERVICE
// ============================================================

import { prisma } from '@/lib/prisma';
import { BlogCommentResponse } from '@/types/blog.types';

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string): Promise<BlogCommentResponse[]> {
  const comments = await prisma.blogComment.findMany({
    where: {
      postId,
      parentId: null, // Only root comments
      status: 'VISIBLE',
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      replies: {
        where: {
          status: 'VISIBLE',
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return comments.map(formatCommentResponse);
}

/**
 * Create a comment
 */
export async function createComment(
  postId: string,
  userId: string,
  content: string,
  parentId?: string
): Promise<BlogCommentResponse> {
  // Validate post exists
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  // Validate parent comment if provided
  if (parentId) {
    const parentComment = await prisma.blogComment.findUnique({
      where: { id: parentId },
    });

    if (!parentComment || parentComment.postId !== postId) {
      throw new Error('Parent comment not found');
    }
  }

  // Create comment
  const comment = await prisma.blogComment.create({
    data: {
      postId,
      userId,
      content,
      parentId,
      status: 'VISIBLE',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  // Increment comment count
  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      commentCount: {
        increment: 1,
      },
    },
  });

  return formatCommentResponse(comment);
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: { userId: true, postId: true },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  // Only comment owner or admin can delete
  if (comment.userId !== userId && !user?.isAdmin) {
    throw new Error('You can only delete your own comments');
  }

  // Soft delete
  await prisma.blogComment.update({
    where: { id: commentId },
    data: {
      deletedAt: new Date(),
      status: 'DELETED',
    },
  });

  // Decrement comment count
  await prisma.blogPost.update({
    where: { id: comment.postId },
    data: {
      commentCount: {
        decrement: 1,
      },
    },
  });
}

/**
 * Update comment status (admin only)
 */
export async function updateCommentStatus(
  commentId: string,
  userId: string,
  status: 'VISIBLE' | 'HIDDEN' | 'PENDING_REVIEW'
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    throw new Error('Only admins can update comment status');
  }

  await prisma.blogComment.update({
    where: { id: commentId },
    data: { status },
  });
}

/**
 * Format comment response
 */
function formatCommentResponse(comment: any): BlogCommentResponse {
  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    parentId: comment.parentId,
    content: comment.content,
    status: comment.status,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    user: comment.user,
    replies: comment.replies?.map(formatCommentResponse),
  };
}
