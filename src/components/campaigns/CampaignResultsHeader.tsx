"use client";

import { useI18n } from "@/i18n";

interface CampaignResultsHeaderProps {
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
}

export function CampaignResultsHeader({ total, page, limit, isLoading }: CampaignResultsHeaderProps) {
  const { t } = useI18n();
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between">
      <div>
        {isLoading ? (
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        ) : (
          <p className="text-sm text-gray-600">
            {t("catalog.showing", { start, end, total })}
          </p>
        )}
      </div>
    </div>
  );
}
