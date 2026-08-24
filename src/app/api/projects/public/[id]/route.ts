import { NextRequest, NextResponse } from 'next/server';
import { projectIdSchema } from '@/lib/project/project.validation';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/project/project.errors';
import {
    handleServiceError,
    validationErrorResponse,
    mapZodErrors,
} from '@/lib/project/project.response-handlers';
import { z } from 'zod';

/**
 * GET /api/projects/public/[id]
 * Get a single project by ID with associated campaigns and blog posts (PUBLIC - no authentication required)
 * 
 * This endpoint is publicly accessible for viewing project details without authentication.
 * It reuses the same data structure as the authenticated endpoint but skips ownership validation.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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

        // Fetch project with associated data using parameterized query (no ownership check)
        const project = await prisma.projects.findUnique({
            where: { id: validatedProjectId },
            include: {
                campaigns: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        status: true,
                        type: true,
                        goalAmount: true,
                        currentAmount: true,
                        imageUrl: true,
                        createdAt: true,
                        rewards: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                minAmount: true,
                                maxQuantity: true,
                                deliveryDate: true,
                                isPreorder: true,
                                onlineDepositPercent: true,
                                codDepositPercent: true,
                                isActive: true,
                                createdAt: true,
                            },
                            orderBy: { createdAt: 'asc' },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                blog_posts: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        excerpt: true,
                        coverImage: true,
                        publishedAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                project_reward_links: {
                    select: { rewardId: true, order: true },
                    orderBy: { order: 'asc' },
                },
                // Linked blog posts (may not belong to the project directly)
                project_blog_links: {
                    include: {
                        blog_posts: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                excerpt: true,
                                coverImage: true,
                                publishedAt: true,
                                status: true,
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        // Return 404 if project not found
        if (!project) {
            const { notFoundResponse } = await import('@/lib/project/project.response-handlers');
            return notFoundResponse('Project not found');
        }

        // Calculate counts
        const campaignCount = project.campaigns.length;
        const blogPostCount = project.blog_posts.length;

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
            linkedBlogPostIds: project.project_blog_links.map((l) => l.blogPostId),
            linkedRewardIds: project.project_reward_links.map((l) => l.rewardId),
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
            campaignCount,
            blogPostCount: Math.max(blogPostCount, project.project_blog_links.length),
            campaigns: project.campaigns.map((c) => ({
                id: c.id,
                title: c.title,
                slug: c.slug,
                status: c.status,
                type: c.type,
                goalAmount: c.goalAmount.toNumber(),
                currentAmount: c.currentAmount.toNumber(),
                imageUrl: c.imageUrl,
                createdAt: c.createdAt.toISOString(),
                rewards: c.rewards.map((r) => ({
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    minAmount: r.minAmount.toNumber(),
                    maxQuantity: r.maxQuantity,
                    deliveryDate: r.deliveryDate ? r.deliveryDate.toISOString() : null,
                    isPreorder: r.isPreorder,
                    onlineDepositPercent: r.onlineDepositPercent,
                    codDepositPercent: r.codDepositPercent,
                    isActive: r.isActive,
                    createdAt: r.createdAt.toISOString(),
                })),
            })),
            blogPosts: [
                ...project.blog_posts.map((b) => ({
                    id: b.id,
                    title: b.title,
                    slug: b.slug,
                    excerpt: b.excerpt,
                    coverImage: b.coverImage,
                    publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
                })),
                // Include linked blog posts that are not directly owned by the project
                ...project.project_blog_links
                    .map((l) => l.blog_posts)
                    .filter((bp): bp is NonNullable<typeof bp> => bp !== null)
                    .filter((bp) => !project.blog_posts.some((owned) => owned.id === bp.id))
                    .map((bp) => ({
                        id: bp.id,
                        title: bp.title,
                        slug: bp.slug,
                        excerpt: bp.excerpt,
                        coverImage: bp.coverImage,
                        publishedAt: bp.publishedAt ? bp.publishedAt.toISOString() : null,
                    })),
            ],
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        const projectId = await params.then(p => p.id).catch(() => 'unknown');
        logError(error as Error, {
            operation: 'getPublicProjectById',
            projectId,
            method: 'GET',
            path: `/api/projects/public/${projectId}`,
            params: { id: projectId },
        });

        return handleServiceError(error);
    }
}
