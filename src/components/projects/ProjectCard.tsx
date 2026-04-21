"use client";

import Link from "next/link";
import { memo } from "react";
import { ProjectListItem } from "@/types/project";
import { formatVND } from "@/lib/utils";
import { Eye, Users, Star, Calendar } from "lucide-react";
import { getCompletionStateLabel, getCompletionStateColor, getCampaignTypeLabel, formatDaysRemaining } from "@/lib/project-helpers";
import CampaignGrowthProgress from "@/components/campaign/CampaignGrowthProgress";

interface ProjectCardProps {
  project: ProjectListItem;
}

export const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/campaigns/${project.slug}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getCompletionStateColor(project.completionState)}`}>
            {getCompletionStateLabel(project.completionState)}
          </span>
          {project.isFeatured && (
            <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-700">
              Nổi bật
            </span>
          )}
        </div>

        {/* Campaign Code */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur">
            {project.campaignCode}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Category & Type */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
            {project.category}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500 font-medium">
            {getCampaignTypeLabel(project.campaignType)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Progress */}
        <CampaignGrowthProgress
          currentAmount={project.currentAmount}
          goalAmount={project.goalAmount}
          variant="compact"
          size="sm"
          showTree={false}
        />

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span className="font-medium">{project.totalBackers}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{project.totalFollowers || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span className="font-medium">{project.totalViews}</span>
            </div>
          </div>

          {project.endDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={14} />
              <span className="font-medium">{formatDaysRemaining(project.endDate)}</span>
            </div>
          )}
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            {project.creatorName.charAt(0)}
          </div>
          <span className="text-xs text-gray-600 font-medium">
            {project.creatorName}
            {project.creatorIsPro && (
              <span className="ml-1 text-emerald-600">✓</span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
});
