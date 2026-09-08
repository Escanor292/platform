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
}

/**
 * Client wrapper for the public project detail page.
 * Owns the "quick edit" dialog state so owners can edit the project
 * in place (without navigating to the dashboard).
 */
export function ProjectDetailPageClient({
  project,
  isOwner,
}: ProjectDetailPageClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState('basic');

  const editProject = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    coverImage: project.coverImage,
    richDescription: project.richDescription,
    heroBackgroundType: project.heroBackgroundType,
    heroBackgroundConfig: project.heroBackgroundConfig,
    linkedBlogPostIds: project.linkedBlogPostIds || [],
    linkedRewardIds: project.linkedRewardIds || [],
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
            onEdit: () => {
              setDialogTab('basic');
              setDialogOpen(true);
            },
          },
          {
            label: 'Sản phẩm dự án',
            description: 'Gắn, gỡ hoặc tạo sản phẩm thuộc dự án — không cần vào chiến dịch',
            onEdit: () => {
              setDialogTab('links');
              setDialogOpen(true);
            },
          },
        ]}
      />
      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={dialogOpen ? editProject : null}
        defaultTab={dialogTab}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
