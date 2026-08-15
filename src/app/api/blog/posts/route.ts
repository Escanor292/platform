// ============================================================
// API: GET /api/blog/posts - List blog posts
// API: POST /api/blog/posts - Create blog post
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createBlogPost, getBlogPostList } from '@/lib/blog/blog.service';
import { CreateBlogPostRequest } from '@/types/blog.types';
import prisma from '@/lib/prisma';
import { projectIdSchema } from '@/lib/project/project.validation';
import {
  validationErrorResponse,
  forbiddenResponse
} from '@/lib/project/project.response-handlers';
import { z } from 'zod';

/**
 * GET /api/blog/posts
 * Public endpoint - list published blog posts with optional project filter
 * Validates: Requirements 11.3, 11.4, 11.5
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;

    const query: any = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      type: searchParams.get('type') || undefined,
      campaignId: searchParams.get('campaignId') || undefined,
      featured: searchParams.get('featured') === 'true' || undefined,
      sort: (searchParams.get('sort') as any) || 'latest',
    };

    // Project filter - Validates Requirements 11.3, 11.4, 11.5
    const projectIdFilter = searchParams.get('projectId');
    if (projectIdFilter) {
      if (projectIdFilter === 'null' || projectIdFilter === 'standalone') {
        // Filter for blog posts with NULL projectId (platform blog posts)
        query.projectId = 'null';
      } else {
        // Filter for blog posts with specific projectId
        query.projectId = projectIdFilter;
      }
    }

    const result = await getBlogPostList(query, session?.user?.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] GET /api/blog/posts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/posts
 * Auth required - create new blog post with optional project association
 * Validates: Requirements 10.1, 10.3, 10.4, 10.5
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateBlogPostRequest & { projectId?: string | null } = await request.json();

    // Validate required fields
    if (!body.title || !body.type || !body.visibility) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, visibility' },
        { status: 400 }
      );
    }

    // Validate campaign_update requires campaignId
    if (body.type === 'CAMPAIGN_UPDATE' && !body.campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required for campaign updates' },
        { status: 400 }
      );
    }

    // Validate projectId if provided (Requirement 10.3, 10.4, 10.5)
    if (body.projectId !== undefined && body.projectId !== null) {
      // Validate projectId format (CUID)
      try {
        projectIdSchema.parse(body.projectId);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return validationErrorResponse('Invalid project ID format');
        }
        throw error;
      }

      // Validate project exists and is owned by authenticated user
      const project = await prisma.projects.findUnique({
        where: { id: body.projectId },
        select: { creatorId: true },
      });

      if (!project) {
        return validationErrorResponse('Project not found');
      }

      if (project.creatorId !== session.user.id) {
        return forbiddenResponse('Not authorized to add blog posts to this project');
      }
    }

    const post = await createBlogPost(session.user.id, body);

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('[API] POST /api/blog/posts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
