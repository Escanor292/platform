"use client";

interface CampaignResultsHeaderProps {
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
}

export function CampaignResultsHeader({ total, page, limit, isLoading }: CampaignResultsHeaderProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between">
      <div>
        {isLoading ? (
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        ) : (
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold text-dblue">{start}-{end}</span> trong tổng số{" "}
            <span className="font-semibold text-dblue">{total}</span> chiến dịch
          </p>
        )}
      </div>
    </div>
  );
}
