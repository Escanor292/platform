// ============================================================
// PROJECT SERVICE - Business Logic Layer
// ============================================================
// Validates: Requirements 4.2, 5.1, 5.2, 6.2, 7.2, 12.1, 18.1, 18.2

import { prisma } from '@/lib/prisma';

// ============================================================
// Service Layer Interfaces
// ============================================================

export interface CreateProjectInput {
    title: string;
    description?: string;
    slug?: string;
    coverImage?: string | null;
    richDescription?: any;
    blogPostIds?: string[];
    rewardIds?: string[];
}

export interface UpdateProjectInput {
    title?: string;
    description?: string;
    slug?: string | null;
    coverImage?: string | null;
    richDescription?: any;
    blogPostIds?: string[];
    rewardIds?: string[];
}

export interface ProjectWithCounts {
    id: string;
    creatorId: string;
    title: string;
    slug: string | null;
    description: string | null;
    coverImage: string | null;
    richDescription: any;
    createdAt: Date;
    updatedAt: Date;
    campaignCount: number;
    blogPostCount: number;
    linkedBlogPostIds: string[];
    linkedRewardIds: string[];
}
export interface ProjectDetail extends ProjectWithCounts {
    campaigns: {
        id: string;
        title: string;
        slug: string;
        status: string;
        goalAmount: number;
        currentAmount: number;
        imageUrl: string | null;
    }[];
    linkedBlogPostIds: string[];
    linkedRewardIds: string[];
    blogPosts: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        coverImage: string | null;
        publishedAt: Date | null;
    }[];
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ============================================================
// Create Project
// Validates: Requirements 4.2, 4.5, 18.1, 18.2
// ============================================================

export async function createProject(
    creatorId: string,
    input: CreateProjectInput
): Promise<ProjectWithCounts> {
    // Create project with parameterized query (SQL injection protection)
    const project = await prisma.projects.create({
        data: {
            creatorId,
            title: input.title,
            description: input.description || null,
            slug: input.slug || null,
            coverImage: input.coverImage ?? null,
            richDescription: input.richDescription ?? null,
            project_blog_links: input.blogPostIds?.length
                ? { create: input.blogPostIds.map((blogPostId) => ({ blogPostId })) }
                : undefined,
            project_reward_links: input.rewardIds?.length
                ? { create: input.rewardIds.map((rewardId) => ({ rewardId })) }
                : undefined,
        },
    });

    // Get counts for associated items (initially 0)
    const [campaignCount, blogPostCount, linkedBlogPostIds, linkedRewardIds] =
        await Promise.all([
            prisma.campaigns.count({
                where: { projectId: project.id },
            }),
            prisma.blog_posts.count({
                where: { projectId: project.id },
            }),
            prisma.project_blog_links
                .findMany({
                    where: { projectId: project.id },
                    select: { blogPostId: true },
                })
                .then((links) => links.map((l) => l.blogPostId)),
            prisma.project_reward_links
                .findMany({
                    where: { projectId: project.id },
                    select: { rewardId: true },
                })
                .then((links) => links.map((l) => l.rewardId)),
        ]);

    return {
        ...project,
        campaignCount,
        blogPostCount,
        linkedBlogPostIds,
        linkedRewardIds,
    };
}

// ============================================================
// Get Project by ID
// Validates: Requirements 12.1, 12.2, 18.1, 18.2, 20.2, 20.4, 20.5
// ============================================================

export async function getProjectById(
    projectId: string,
    userId: string
): Promise<ProjectDetail> {
    // First validate ownership
    await validateProjectOwnership(projectId, userId, true);

    // Fetch project with associated data using parameterized query
    const project = await prisma.projects.findUnique({
        where: { id: projectId },
        include: {
            campaigns: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    status: true,
                    goalAmount: true,
                    currentAmount: true,
                    imageUrl: true,
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
                    status: true,
                },
                orderBy: { createdAt: 'desc' },
            },
            project_blog_links: {
                select: { blogPostId: true, order: true },
                orderBy: { order: 'asc' },
            },
            project_reward_links: {
                select: { rewardId: true, order: true },
                orderBy: { order: 'asc' },
            },
        },
    });

    // This should not happen after validateProjectOwnership, but as a safeguard
    if (!project) {
        throw new Error('Project not found');
    }

    // Calculate counts
    const campaignCount = project.campaigns.length;
    const blogPostCount = project.blog_posts.length;
    const linkedBlogPostIds = project.project_blog_links.map((l) => l.blogPostId);
    const linkedRewardIds = project.project_reward_links.map((l) => l.rewardId);

    return {
        id: project.id,
        creatorId: project.creatorId,
        title: project.title,
        slug: project.slug,
        description: project.description,
        coverImage: project.coverImage,
        richDescription: project.richDescription,
        linkedBlogPostIds,
        linkedRewardIds,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        campaignCount,
        blogPostCount,
        campaigns: project.campaigns.map((c) => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            status: c.status,
            goalAmount: c.goalAmount.toNumber(),
            currentAmount: c.currentAmount.toNumber(),
            imageUrl: c.imageUrl,
        })),
        blogPosts: project.blog_posts.map((b) => ({
            id: b.id,
            title: b.title,
            slug: b.slug,
            excerpt: b.excerpt,
            coverImage: b.coverImage,
            publishedAt: b.publishedAt,
        })),
    };
}

// ============================================================
// List Projects
// Validates: Requirements 5.1, 5.2, 5.3, 18.1, 18.2
// ============================================================

export async function listProjects(
    creatorId: string,
    pagination: PaginationParams
): Promise<PaginatedResponse<ProjectWithCounts>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Execute queries with parameterized values
    const [projects, total] = await Promise.all([
        prisma.projects.findMany({
            where: { creatorId },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.projects.count({
            where: { creatorId },
        }),
    ]);

    // Get counts for each project efficiently
    const projectsWithCounts = await Promise.all(
        projects.map(async (project) => {
            const [campaignCount, blogPostCount, linkedBlogPostIds, linkedRewardIds] =
                await Promise.all([
                    prisma.campaigns.count({
                        where: { projectId: project.id },
                    }),
                    prisma.blog_posts.count({
                        where: { projectId: project.id },
                    }),
                    prisma.project_blog_links
                        .findMany({
                            where: { projectId: project.id },
                            select: { blogPostId: true },
                        })
                        .then((links) => links.map((l) => l.blogPostId)),
                    prisma.project_reward_links
                        .findMany({
                            where: { projectId: project.id },
                            select: { rewardId: true },
                        })
                        .then((links) => links.map((l) => l.rewardId)),
                ]);

            return {
                ...project,
                campaignCount,
                blogPostCount,
                linkedBlogPostIds,
                linkedRewardIds,
            };
        })
    );

    const totalPages = Math.ceil(total / limit);

    return {
        data: projectsWithCounts,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
}

// ============================================================
// Update Project
// Validates: Requirements 6.2, 6.5, 12.1, 12.3, 18.1, 18.2
// ============================================================

export async function updateProject(
    projectId: string,
    userId: string,
    input: UpdateProjectInput
): Promise<ProjectWithCounts> {
    // Validate ownership first
    await validateProjectOwnership(projectId, userId);

    // Build update data object with only provided fields
    const updateData: any = {};
    if (input.title !== undefined) {
        updateData.title = input.title;
    }
    if (input.description !== undefined) {
        updateData.description = input.description || null;
    }
    if (input.slug !== undefined) {
        updateData.slug = input.slug || null;
    }
    if (input.coverImage !== undefined) {
        updateData.coverImage = input.coverImage || null;
    }
    if (input.richDescription !== undefined) {
        updateData.richDescription = input.richDescription || null;
    }

    // Sync blog links if provided (replace all)
    if (input.blogPostIds !== undefined) {
        updateData.project_blog_links = {
            deleteMany: {},
            create: input.blogPostIds.map((blogPostId, index) => ({
                blogPostId,
                order: index,
            })),
        };
    }

    // Sync reward links if provided (replace all)
    if (input.rewardIds !== undefined) {
        updateData.project_reward_links = {
            deleteMany: {},
            create: input.rewardIds.map((rewardId, index) => ({
                rewardId,
                order: index,
            })),
        };
    }

    // Update project with parameterized query
    const project = await prisma.projects.update({
        where: { id: projectId },
        data: updateData,
    });

    // Get updated counts and linked items
    const [campaignCount, blogPostCount, linkedBlogPostIds, linkedRewardIds] =
        await Promise.all([
            prisma.campaigns.count({
                where: { projectId: project.id },
            }),
            prisma.blog_posts.count({
                where: { projectId: project.id },
            }),
            prisma.project_blog_links
                .findMany({
                    where: { projectId: project.id },
                    orderBy: { order: 'asc' },
                    select: { blogPostId: true },
                })
                .then((links) => links.map((l) => l.blogPostId)),
            prisma.project_reward_links
                .findMany({
                    where: { projectId: project.id },
                    orderBy: { order: 'asc' },
                    select: { rewardId: true },
                })
                .then((links) => links.map((l) => l.rewardId)),
        ]);

    return {
        ...project,
        campaignCount,
        blogPostCount,
        linkedBlogPostIds,
        linkedRewardIds,
    };
}

// ============================================================
// Delete Project
// Validates: Requirements 7.2, 7.3, 7.4, 12.1, 12.4, 18.1, 18.2
// ============================================================

export async function deleteProject(
    projectId: string,
    userId: string
): Promise<void> {
    // Validate ownership first
    await validateProjectOwnership(projectId, userId);

    // Delete project (CASCADE will set projectId to NULL in campaigns and blog_posts)
    await prisma.projects.delete({
        where: { id: projectId },
    });
}

// ============================================================
// Validate Project Ownership Helper
// Validates: Requirements 12.1, 12.2, 12.3, 12.4, 18.1, 18.2, 18.4
// ============================================================

export async function validateProjectOwnership(
    projectId: string,
    userId: string,
    allowAdmin: boolean = true
): Promise<boolean> {
    // Fetch project with parameterized query
    const project = await prisma.projects.findUnique({
        where: { id: projectId },
        select: { creatorId: true },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    // Check if user is the owner
    if (project.creatorId === userId) {
        return true;
    }

    // Check if admin access is allowed
    if (allowAdmin) {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { isAdmin: true },
        });

        if (user?.isAdmin) {
            return true;
        }
    }

    // Not authorized
    throw new Error('Not authorized to access this project');
}
