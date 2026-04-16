"use client";

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="h-48 bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        {/* Category & Type */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded-full" />
          <div className="h-6 w-24 bg-gray-200 rounded" />
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
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded" />
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

export function ProjectGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
