"use client";

import Link from "next/link";
import { memo } from "react";
import { CampaignListItem } from "@/types/campaign";
import { Tag, Layers } from "lucide-react";
import { getCompletionStateColor, getDaysRemaining } from "@/lib/campaign-helpers";
import { getTagLabel } from "@/lib/taxonomy-helpers";
import CampaignGrowthProgress from "@/components/campaign/CampaignGrowthProgress";
import CatalogLabel from "@/i18n/CatalogLabel";
import UgcText from "@/i18n/UgcText";
import { useI18n } from "@/i18n";

interface CampaignCardProps {
  project: CampaignListItem;
}

function extractTextFromDescription(description: string): string {
  if (!description) return "";
  try {
    const parsed = JSON.parse(description);
    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      const firstPara = parsed.content.find(
        (node: any) => node.type === "paragraph" && node.content?.length > 0
      );
      if (firstPara) {
        return firstPara.content.map((n: any) => n.text || "").join("");
      }
      return "";
    }
  } catch {
    // Not JSON
  }
  return description;
}

const STATE_EN: Record<string, string> = {
  NOT_STARTED: "Not started",
  ONGOING: "Fundraising",
  GOAL_REACHED: "Goal reached",
  COMPLETED: "Completed",
  FAILED: "Ended",
  PAUSED: "Paused",
};
const STATE_VI: Record<string, string> = {
  NOT_STARTED: "Chưa bắt đầu",
  ONGOING: "Đang gây quỹ",
  GOAL_REACHED: "Đã đạt mục tiêu",
  COMPLETED: "Đã hoàn thành",
  FAILED: "Đã kết thúc",
  PAUSED: "Tạm dừng",
};

export const CampaignCard = memo(function CampaignCard({ project }: CampaignCardProps) {
  const { t, locale } = useI18n();
  const preview = extractTextFromDescription(project.description);
  const days = getDaysRemaining(project.endDate);
  const daysLabel =
    days === null
      ? locale === "en" ? "No deadline" : "Vô thời hạn"
      : days < 0
        ? t("home.ended")
        : days === 0
          ? locale === "en" ? "Ends today" : "Kết thúc hôm nay"
          : t("home.daysLeft", { n: days });

  return (
    <Link
      href={`/campaigns/${project.slug}`}
      className="group h-full flex flex-col bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-[210px] md:h-[200px] lg:h-[220px] overflow-hidden bg-gray-100">
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getCompletionStateColor(project.completionState)}`}>
            {(locale === "en" ? STATE_EN : STATE_VI)[project.completionState] || project.completionState}
          </span>
          {project.isFeatured && (
            <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-ebrown/10 text-ebrown">
              {t("catalog.featured")}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span
            className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur"
            title={project.campaignCode}
          >
            {project.campaignCode.length > 10
              ? `${project.campaignCode.substring(0, 6)}...${project.campaignCode.slice(-4)}`
              : project.campaignCode}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 min-h-0">
        <div className="flex flex-nowrap gap-2 overflow-hidden h-6 mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-tblue/10 text-tblue rounded-md text-[9px] font-black uppercase tracking-wider border border-tblue/20 italic">
            <Tag size={10} />
            <CatalogLabel kind="category" value={project.category} />
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border italic ${project.campaignType === "REWARD"
            ? "bg-pgreen/10 text-pgreen border-pgreen/20"
            : "bg-ebrown/10 text-ebrown border-ebrown/20"
            }`}>
            <Layers size={10} />
            <CatalogLabel kind="type" value={project.campaignType} />
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border italic bg-gray-50 text-gray-600 border-gray-200">
            <CatalogLabel kind="funding" value={project.fundingModel} />
          </span>
        </div>

        {project.tags?.length > 0 && (
          <div className="flex flex-nowrap gap-1 overflow-hidden h-6 mb-4">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="shrink-0 px-2 py-0.5 rounded-md bg-gray-50 text-[10px] font-semibold text-gray-500">
                #{getTagLabel(tag)}
              </span>
            ))}
          </div>
        )}

        <UgcText
          as="h3"
          text={project.title}
          title
          className="font-display font-bold text-lg text-dblue line-clamp-2 min-h-[2.75rem] overflow-hidden break-words group-hover:text-pgreen transition-colors leading-tight"
        />
        <UgcText
          as="p"
          text={preview || (locale === "en" ? "Description coming soon." : "Chiến dịch đang cập nhật mô tả.")}
          className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem] overflow-hidden leading-relaxed mt-2"
        />

        <div className="mt-4">
          <CampaignGrowthProgress
            currentAmount={project.currentAmount}
            goalAmount={project.goalAmount}
            variant="compact"
            size="sm"
            showTree={false}
          />
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span className="font-medium">{locale === "en" ? `${project.totalBackers} backers` : `${project.totalBackers} ủng hộ`}</span>
            {project.endDate && <span className="font-medium">{daysLabel}</span>}
          </div>
          <div className="pt-4">
            <div className="block w-full text-center px-4 py-2.5 rounded-xl gradient-green text-white font-bold text-sm group-hover:shadow-lg transition-all">
              {locale === "en" ? "View details" : "Xem chi tiết"}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-4">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              {project.creatorName.charAt(0)}
            </div>
            <span className="text-xs text-dblue font-medium truncate">
              {project.creatorName}
              {project.creatorIsPro && <span className="ml-1 text-pgreen">✓</span>}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});
