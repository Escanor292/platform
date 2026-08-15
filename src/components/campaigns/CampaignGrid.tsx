"use client";

import { CampaignListItem } from "@/types/campaign";
import { CampaignCard } from "./CampaignCard";

interface CampaignGridProps {
  projects: CampaignListItem[];
}

export function CampaignGrid({ projects }: CampaignGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <CampaignCard key={project.id} project={project} />
      ))}
    </div>
  );
}
