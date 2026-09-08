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
import { sumProjectMoney } from '@/lib/money-buckets';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const authError = checkAuthentication(session);
        if (authError) return authError;

        const userId = session!.user!.id as string;
        const { id: projectId } = await params;

        let validatedProjectId;
        try {
            validatedProjectId = projectIdSchema.parse(projectId);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(mapZodErrors(error));
            }
            throw error;
        }

        const projectDetail = await getProjectById(validatedProjectId, userId);
        const money = await sumProjectMoney(validatedProjectId);

        const response = {
            id: projectDetail.id,
            creatorId: projectDetail.creatorId,
            title: projectDetail.title,
            slug: projectDetail.slug,
            description: projectDetail.description,
            coverImage: projectDetail.coverImage,
            richDescription: projectDetail.richDescription,
            heroBackgroundType: projectDetail.heroBackgroundType,
            heroBackgroundConfig: projectDetail.heroBackgroundConfig,
            linkedBlogPostIds: projectDetail.linkedBlogPostIds,
            linkedRewardIds: projectDetail.linkedRewardIds,
            createdAt: projectDetail.createdAt.toISOString(),
            updatedAt: projectDetail.updatedAt.toISOString(),
            campaignCount: projectDetail.campaignCount,
            blogPostCount: projectDetail.blogPostCount,
            campaignTotal: money.campaignTotal,
            productTotal: money.productTotal,
            projectTotal: money.projectTotal,
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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const authError = checkAuthentication(session);
        if (authError) return authError;

        const userId = session!.user!.id as string;
        const { id: projectId } = await params;

        let validatedProjectId;
        try {
            validatedProjectId = projectIdSchema.parse(projectId);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(mapZodErrors(error));
            }
            throw error;
        }

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

        const updatedProject = await updateProject(
            validatedProjectId,
            userId,
            validatedInput
        );

        const response = {
            id: updatedProject.id,
            creatorId: updatedProject.creatorId,
            title: updatedProject.title,
            slug: updatedProject.slug,
            description: updatedProject.description,
            coverImage: updatedProject.coverImage,
            richDescription: updatedProject.richDescription,
            heroBackgroundType: updatedProject.heroBackgroundType,
            heroBackgroundConfig: updatedProject.heroBackgroundConfig,
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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const authError = checkAuthentication(session);
        if (authError) return authError;

        const userId = session!.user!.id as string;
        const { id: projectId } = await params;

        let validatedProjectId;
        try {
            validatedProjectId = projectIdSchema.parse(projectId);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(mapZodErrors(error));
            }
            throw error;
        }

        await deleteProject(validatedProjectId, userId);

        console.log('[DELETE /api/projects/[id]]', {
            operation: 'deleteProject',
            userId,
            projectId: validatedProjectId,
            timestamp: new Date().toISOString(),
        });

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
