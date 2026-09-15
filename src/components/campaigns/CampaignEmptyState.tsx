"use client";

import { Search, Filter } from "lucide-react";
import { useI18n } from "@/i18n";

interface CampaignEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function CampaignEmptyState({ hasFilters, onClearFilters }: CampaignEmptyStateProps) {
  const { t } = useI18n();
  return (
    <div className="glass rounded-3xl py-16 px-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        {hasFilters ? (
          <Filter className="text-gray-400" size={32} />
        ) : (
          <Search className="text-gray-400" size={32} />
        )}
      </div>

      <h3 className="font-display text-xl font-bold text-dblue mb-2">
        {t("catalog.emptyTitle")}
      </h3>

      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {t("catalog.emptySub")}
      </p>

      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl gradient-green text-white font-bold hover:shadow-lg transition-all"
        >
          {t("catalog.clearFilters")}
        </button>
      )}
    </div>
  );
}
