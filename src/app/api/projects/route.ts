import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createProjectSchema, paginationSchema } from '@/lib/project/project.validation';
import { createProject, listProjects } from '@/lib/project/project.service';
import { logError } from '@/lib/project/project.errors';
import {
  checkAuthentication,
  checkCreatorRole,
  handleServiceError,
  validationErrorResponse,
  mapZodErrors,
} from '@/lib/project/project.response-handlers';
import { z } from 'zod';
import { assertCleanContent } from '@/lib/moderation';

/**
 * POST /api/projects
 * Create a new project
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    const authError = checkAuthentication(session);
    if (authError) return authError;

    // TypeScript knows session exists after authentication check
    const userId = session!.user!.id as string;

    // Check creator role
    const roleError = checkCreatorRole(session);
    if (roleError) return roleError;

    // Parse and validate request body
    const body = await req.json();

    let validatedData;
    try {
      validatedData = createProjectSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(mapZodErrors(error));
      }
      throw error;
    }

    try {
      await assertCleanContent([validatedData.title, validatedData.description]);
    } catch (error: any) {
      return validationErrorResponse(error.message || 'Nội dung chứa từ bị cấm');
    }

    // Create project
    const project = await createProject(userId, validatedData);

    // Convert Date objects to ISO 8601 strings for response
    const response = {
      id: project.id,
      creatorId: project.creatorId,
      title: project.title,
      slug: project.slug,
      description: project.description,
      coverImage: project.coverImage,
      richDescription: project.richDescription,
      heroBackgroundType: project.heroBackgroundType,
      heroBackgroundConfig: project.heroBackgroundConfig,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      campaignCount: project.campaignCount,
      blogPostCount: project.blogPostCount,
      linkedBlogPostIds: project.linkedBlogPostIds,
      linkedRewardIds: project.linkedRewardIds,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const session = await auth();
    logError(error as Error, {
      operation: 'createProject',
      userId: session?.user?.id || 'unknown',
      method: 'POST',
      path: '/api/projects',
      body: await req.json().catch(() => ({})),
    });

    return handleServiceError(error);
  }
}

/**
 * GET /api/projects
 * List projects for the authenticated user
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 19.4
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    const authError = checkAuthentication(session);
    if (authError) return authError;

    // TypeScript knows session exists after authentication check
    const userId = session!.user!.id as string;

    // Parse and validate pagination query parameters
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    let paginationParams;
    try {
      paginationParams = paginationSchema.parse({
        page: page || undefined,
        limit: limit || undefined,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(mapZodErrors(error));
      }
      throw error;
    }

    // Get projects for the authenticated user
    const result = await listProjects(userId, paginationParams);

    // Convert Date objects to ISO 8601 strings for response
    const response = {
      data: result.data.map((project) => ({
        id: project.id,
        creatorId: project.creatorId,
        title: project.title,
        description: project.description,
        slug: project.slug,
        coverImage: project.coverImage,
        richDescription: project.richDescription,
        heroBackgroundType: project.heroBackgroundType,
        heroBackgroundConfig: project.heroBackgroundConfig,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        campaignCount: project.campaignCount,
        blogPostCount: project.blogPostCount,
        linkedBlogPostIds: project.linkedBlogPostIds,
        linkedRewardIds: project.linkedRewardIds,
      })),
      pagination: result.pagination,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const session = await auth();
    logError(error as Error, {
      operation: 'listProjects',
      userId: session?.user?.id || 'unknown',
      method: 'GET',
      path: '/api/projects',
      params: { page: new URL(req.url).searchParams.get('page'), limit: new URL(req.url).searchParams.get('limit') },
    });

    return handleServiceError(error);
  }
}
