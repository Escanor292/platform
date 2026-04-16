"use client";

interface ProjectResultsHeaderProps {
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
}

export function ProjectResultsHeader({ total, page, limit, isLoading }: ProjectResultsHeaderProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between">
      <div>
        {isLoading ? (
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        ) : (
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-bold text-gray-900">{start}-{end}</span> trong tổng số{" "}
            <span className="font-bold text-gray-900">{total}</span> dự án
          </p>
        )}
      </div>
    </div>
  );
}
