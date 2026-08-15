"use client";

export function CampaignCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden shadow-md bg-white animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="h-[210px] md:h-[200px] lg:h-[220px] bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Category & Type */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-5 w-16 bg-gray-200 rounded" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full w-full" />
          <div className="flex justify-between">
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <div className="h-10 bg-gray-200 rounded-xl w-full" />
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="w-6 h-6 rounded-full bg-gray-200" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function CampaignGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  );
}
