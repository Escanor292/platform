import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { projectIdSchema, updateProjectSchema } from '@/lib/project/project.validation';
import { getProjectById, updateProject, deleteProject } from '@/lib/project/project.service';
import { logError } from '@/lib/project/project.errors';
import {
    checkAuthentication,
    handleServiceError,
    validationErrorResponse,
    mapZodErrors,
} from '@/lib/project/project.response-handlers';
import { z } from 'zod';

/**
 * GET /api/projects/[id]
 * Get a single project by ID with associated campaigns and blog posts
 * 
 * Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const session = await auth();
        const authError = checkAuthentication(session);
        if (authError) return authError;

        // TypeScript knows session exists after authentication check
        const userId = session!.user!.id as string;

        // Await params to get the project ID
        const { id: projectId } = await params;

        // Validate projectId format
        let validatedProjectId;
        try {
            validatedProjectId = projectIdSchema.parse(projectId);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(mapZodErrors(error));
            }
            throw error;
        }

        // Get project detail with authorization check
        const projectDetail = await getProjectById(validatedProjectId, userId);

        // Convert Date objects to ISO 8601 strings for response
        const response = {
            id: projectDetail.id,
            creatorId: projectDetail.creatorId,
            title: projectDetail.title,
            slug: projectDetail.slug,
            description: projectDetail.description,
            coverImage: projectDetail.coverImage,
            richDescription: projectDetail.richDescription,
            linkedBlogPostIds: projectDetail.linkedBlogPostIds,
            linkedRewardIds: projectDetail.linkedRewardIds,
            createdAt: projectDetail.createdAt.toISOString(),
            updatedAt: projectDetail.updatedAt.toISOString(),
            campaignCount: projectDetail.campaignCount,
            blogPostCount: projectDetail.blogPostCount,
            campaigns: projectDetail.campaigns,
            blogPosts: projectDetail.blogPosts.map((post) => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                coverImage: post.coverImage,
                publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
            })),
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        const projectId = await params.then(p => p.id).catch(() => 'unknown');
        logError(error as Error, {
            operation: 'getProjectById',
            userId: (await auth())?.user?.id,
            projectId,
            method: 'GET',
            path: `/api/projects/${projectId}`,
            params: { id: projectId },
        });

        return handleServiceError(error);
    }
}

/**
 * PATCH /api/projects/[id]
 * Update a project's title and/or description
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const session = await auth();
        const authError = checkAuthentication(session);
        if (authError) return authError;

        // TypeScript knows session exists after authentication check
        const userId = session!.user!.id as string;

        // Await params to get the project ID
        const { id: projectId } = await params;

        // Validate projectId format
        let validatedProjectId;
        try {
            validatedProjectId = projectIdSchema.parse(projectId);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(mapZodErrors(error));
            }
            throw error;
        }

        // Parse and validate request body
        let body;
        try {
            body = await req.json();
        } catch (error) {
            return validationErrorResponse('Invalid JSON body');
        }

        let validatedInput;
        try {
            validatedInput = updateProjectSchema.parse(body);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(mapZodErrors(error));
            }
            throw error;
        }

        // Update project with ownership validation
        const updatedProject = await updateProject(
            validatedProjectId,
            userId,
            validatedInput
        );

        // Convert Date objects to ISO 8601 strings for response
        const response = {
            id: updatedProject.id,
            creatorId: updatedProject.creatorId,
            title: updatedProject.title,
            slug: updatedProject.slug,
            description: updatedProject.description,
            coverImage: updatedProject.coverImage,
            richDescription: updatedProject.richDescription,
            linkedBlogPostIds: updatedProject.linkedBlogPostIds,
            linkedRewardIds: updatedProject.linkedRewardIds,
            createdAt: updatedProject.createdAt.toISOString(),
            updatedAt: updatedProject.updatedAt.toISOString(),
            campaignCount: updatedProject.campaignCount,
            blogPostCount: updatedProject.blogPostCount,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        const projectId = await params.then(p => p.id).catch(() => 'unknown');
        logError(error as Error, {
            operation: 'updateProject',
            userId: (await auth())?.user?.id,
            projectId,
            method: 'PATCH',
            path: `/api/projects/${projectId}`,
            params: { id: projectId },
            body: await req.json().catch(() => ({})),
        });

        return handleServiceError(error);
    }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project (orphans associated campaigns and blog posts)
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 18.5
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const session = await auth();
        const authError = checkAuthentication(session);
        if (authError) return authError;

        // TypeScript knows session exists after authentication check
        const userId = session!.user!.id as string;

        // Await params to get the project ID
        const { id: projectId } = await params;

        // Validate projectId format
        let validatedProjectId;
        try {
            validatedProjectId = projectIdSchema.parse(projectId);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(mapZodErrors(error));
            }
            throw error;
        }

        // Delete project with ownership validation
        await deleteProject(validatedProjectId, userId);

        // Log deletion operation (Requirement 18.5)
        console.log('[DELETE /api/projects/[id]]', {
            operation: 'deleteProject',
            userId,
            projectId: validatedProjectId,
            timestamp: new Date().toISOString(),
        });

        // Return 204 No Content on success
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        const projectId = await params.then(p => p.id).catch(() => 'unknown');
        logError(error as Error, {
            operation: 'deleteProject',
            userId: (await auth())?.user?.id,
            projectId,
            method: 'DELETE',
            path: `/api/projects/${projectId}`,
            params: { id: projectId },
        });

        return handleServiceError(error);
    }
}
