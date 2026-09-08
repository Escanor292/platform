import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { ProjectDetailPageClient } from './ProjectDetailPageClient';
import { buildSocialMetadata } from '@/lib/seo';
import { getPublicProjectDetail } from '@/lib/project/get-public-project-detail';

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

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { projectId } = await params;
    const session = await auth();
    const project = await getPublicProjectDetail(projectId);

    if (!project) {
        notFound();
    }

    const isOwner = Boolean(session?.user && (session.user as any).id === project.creatorId);
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.isAdmin === true;
    if (project.isLocked && !isOwner && !isAdmin) {
        notFound();
    }

    return (
        <ProjectDetailPageClient
            project={project}
            isOwner={!!isOwner}
        />
    );
}
