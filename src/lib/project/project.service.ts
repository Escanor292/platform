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
}

export interface UpdateProjectInput {
    title?: string;
    description?: string;
}

export interface ProjectWithCounts {
    id: string;
    creatorId: string;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    campaignCount: number;
    blogPostCount: number;
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
        },
    });

    // Get counts for associated items (initially 0)
    const [campaignCount, blogPostCount] = await Promise.all([
        prisma.campaigns.count({
            where: { projectId: project.id },
        }),
        prisma.blog_posts.count({
            where: { projectId: project.id },
        }),
    ]);

    return {
        ...project,
        campaignCount,
        blogPostCount,
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
                },
                orderBy: { createdAt: 'desc' },
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

    return {
        id: project.id,
        creatorId: project.creatorId,
        title: project.title,
        description: project.description,
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
            const [campaignCount, blogPostCount] = await Promise.all([
                prisma.campaigns.count({
                    where: { projectId: project.id },
                }),
                prisma.blog_posts.count({
                    where: { projectId: project.id },
                }),
            ]);

            return {
                ...project,
                campaignCount,
                blogPostCount,
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

    // Update project with parameterized query
    const project = await prisma.projects.update({
        where: { id: projectId },
        data: updateData,
    });

    // Get updated counts
    const [campaignCount, blogPostCount] = await Promise.all([
        prisma.campaigns.count({
            where: { projectId: project.id },
        }),
        prisma.blog_posts.count({
            where: { projectId: project.id },
        }),
    ]);

    return {
        ...project,
        campaignCount,
        blogPostCount,
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
