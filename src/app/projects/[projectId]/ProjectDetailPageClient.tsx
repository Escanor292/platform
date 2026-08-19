'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectDetailClient from './ProjectDetailClient';
import { PublicProjectDetail } from '@/types/project-detail';
import OwnerEditPanel from '@/components/OwnerEditPanel';
import { ProjectFormDialog } from '@/components/dashboard/ProjectFormDialog';

interface ProjectDetailPageClientProps {
  project: PublicProjectDetail;
  isOwner: boolean;
  campaignWithRewards?: { slug: string } | undefined;
}

/**
 * Client wrapper for the public project detail page.
 * Owns the "quick edit" dialog state so owners can edit the project
 * in place (without navigating to the dashboard).
 */
export function ProjectDetailPageClient({
  project,
  isOwner,
  campaignWithRewards,
}: ProjectDetailPageClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const editProject = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    coverImage: project.coverImage,
    richDescription: project.richDescription,
    linkedBlogPostIds: (project as any).linkedBlogPostIds || [],
    linkedRewardIds: (project as any).linkedRewardIds || [],
  };

  return (
    <>
      <ProjectDetailClient project={project} />
      <OwnerEditPanel
        isOwner={isOwner}
        blocks={[
          {
            label: 'Thông tin dự án',
            description: 'Tiêu đề, mô tả, ảnh bìa, liên kết',
            onEdit: () => setDialogOpen(true),
          },
          ...(campaignWithRewards
            ? [
                {
                  label: 'Sản phẩm/Rewards',
                  editUrl: `/dashboard/creator/rewards/${campaignWithRewards.slug}`,
                  description: 'Quản lý quà tặng',
                },
              ]
            : []),
        ]}
      />
      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={dialogOpen ? editProject : null}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
