import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import ProjectDetailClient from './ProjectDetailClient';
import { PublicProjectDetail } from '@/types/project-detail';
import OwnerEditPanel from '@/components/OwnerEditPanel';

interface ProjectPageProps {
    params: Promise<{ projectId: string }>;
}

async function getProjectDetail(projectId: string): Promise<PublicProjectDetail | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects/public/${projectId}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
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

    // Find first campaign with rewards
    const campaignWithRewards = project.campaigns.find(c => c.rewards && c.rewards.length > 0);

    return (
        <>
            <ProjectDetailClient project={project} />
            <OwnerEditPanel
                isOwner={!!isOwner}
                blocks={[
                    {
                        label: 'Thông tin dự án',
                        editUrl: '/dashboard/creator/projects',
                        description: 'Tiêu đề, mô tả'
                    },
                    ...(campaignWithRewards ? [{
                        label: 'Sản phẩm/Rewards',
                        editUrl: `/dashboard/creator/rewards/${campaignWithRewards.slug}`,
                        description: 'Quản lý quà tặng'
                    }] : [])
                ]}
            />
        </>
    );
}
