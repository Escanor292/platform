// ============================================================
// API: GET /api/blog/posts/[slug] - Get blog post by slug
// API: PATCH /api/blog/posts/[slug] - Update blog post
// API: DELETE /api/blog/posts/[slug] - Delete blog post
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost,
} from '@/lib/blog/blog.service';
import { UpdateBlogPostRequest } from '@/types/blog.types';
import { prisma } from '@/lib/prisma';
import { projectIdSchema } from '@/lib/project/project.validation';
import {
  validationErrorResponse,
  forbiddenResponse
} from '@/lib/project/project.response-handlers';
import { z } from 'zod';

/**
 * GET /api/blog/posts/[slug]
 * Get blog post detail by slug
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {

  const params = await context.params;
  try {
    const session = await auth();
    const { slug } = params;

    const post = await getBlogPostBySlug(slug, session?.user?.id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('[API] GET /api/blog/posts/[slug] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog post' },
      { status: error.message.includes('permission') ? 403 : 500 }
    );
  }
}

/**
 * PATCH /api/blog/posts/[slug]
 * Update blog post with optional project association
 * Validates: Requirements 10.2, 10.3, 10.4, 10.5
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { slug } = params;

    // Get post ID from slug
    const post = await prisma.blog_posts.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body: UpdateBlogPostRequest & { projectId?: string | null } = await request.json();

    // Validate projectId if provided (Requirement 10.3, 10.4, 10.5)
    if ('projectId' in body) {
      if (body.projectId === null) {
        // Allow setting to null to make blog post standalone (platform blog)
        // No validation needed
      } else if (body.projectId) {
        // Validate projectId format (CUID)
        try {
          projectIdSchema.parse(body.projectId);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return validationErrorResponse('Invalid project ID format');
          }
          throw error;
        }

        // Validate project exists and is owned by blog post author
        const project = await prisma.projects.findUnique({
          where: { id: body.projectId },
          select: { creatorId: true },
        });

        if (!project) {
          return validationErrorResponse('Project not found');
        }

        if (project.creatorId !== post.authorId) {
          return forbiddenResponse('Not authorized to add blog posts to this project');
        }
      }
    }

    const updatedPost = await updateBlogPost(post.id, session.user.id, body);

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error('[API] PATCH /api/blog/posts/[slug] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update blog post' },
      { status: error.message.includes('permission') ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/blog/posts/[slug]
 * Delete blog post (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { slug } = params;

    // Get post ID from slug
    const post = await prisma.blog_posts.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await deleteBlogPost(post.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] DELETE /api/blog/posts/[slug] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete blog post' },
      { status: error.message.includes('permission') ? 403 : 500 }
    );
  }
}
