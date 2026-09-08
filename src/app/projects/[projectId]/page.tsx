import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import ProjectDetailClient from './ProjectDetailClient';
import { PublicProjectDetail } from '@/types/project-detail';
import OwnerEditPanel from '@/components/OwnerEditPanel';
import { ProjectDetailPageClient } from './ProjectDetailPageClient';
import { buildSocialMetadata } from '@/lib/seo';

interface ProjectPageProps {
    params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
    const { projectId } = await params;
    const { prisma } = await import('@/lib/prisma');
    const project = await prisma.projects.findUnique({
        where: { id: projectId },
        select: { title: true, description: true, coverImage: true, isLocked: true, updatedAt: true },
    });
    if (!project || project.isLocked) {
        return { title: 'Dự án', robots: { index: false, follow: false } };
    }
    return buildSocialMetadata({
        title: project.title,
        description: project.description,
        path: `/projects/${projectId}`,
        image: project.coverImage,
        modifiedTime: project.updatedAt.toISOString(),
    });
}

async function getProjectDetail(projectId: string): Promise<PublicProjectDetail | null> {
    try {
        // Public read: fetch project directly (no ownership check needed)
        const { prisma } = await import('@/lib/prisma');
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
                        rewards: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                minAmount: true,
                                productImages: true,
                                isIncludedInProject: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                blog_posts: {
                    where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
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
                project_reward_links: {
                    select: { rewardId: true, order: true },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!project) return null;

        const rewards = project.campaigns.flatMap((c) => c.rewards);
        return {
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
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            campaignCount: project.campaigns.length,
            blogPostCount: project.blog_posts.length,
            campaigns: project.campaigns.map((c) => ({
                id: c.id,
                title: c.title,
                slug: c.slug,
                status: c.status,
                goalAmount: Number(c.goalAmount),
                currentAmount: Number(c.currentAmount),
                imageUrl: c.imageUrl,
                rewards: c.rewards.map((r) => ({
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    minAmount: Number(r.minAmount),
                    imageUrl: Array.isArray(r.productImages) && r.productImages.length > 0
                        ? r.productImages[0]
                        : null,
                    isIncludedInProject: r.isIncludedInProject,
                })),
            })),
            blogPosts: [
                ...project.blog_posts.map((b) => ({
                    id: b.id,
                    title: b.title,
                    slug: b.slug,
                    excerpt: b.excerpt,
                    coverImage: b.coverImage,
                    publishedAt: b.publishedAt,
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
                        publishedAt: bp.publishedAt,
                    })),
            ],
        } as unknown as PublicProjectDetail;
    } catch (error) {
        console.error('Error fetching project detail:', error);
        return null;
    }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { projectId } = await params;
    const session = await auth();
    const project = await getProjectDetail(projectId);

    if (!project) {
        notFound();
    }

    const isOwner = session?.user && (session.user as any).id === project.creatorId;
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.isAdmin === true;
    if ((project as any).isLocked && !isOwner && !isAdmin) {
        notFound();
    }

    // Find first campaign with rewards
    const campaignWithRewards = project.campaigns.find(c => c.rewards && c.rewards.length > 0);

    return (
        <ProjectDetailPageClient
            project={project}
            isOwner={!!isOwner}
            campaignWithRewards={campaignWithRewards}
        />
    );
}
