export default function CampaignSlugLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-80 bg-gray-200 w-full" />

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>

          {/* Creator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>

          {/* Description paragraphs */}
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full" />
            ))}
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow space-y-4">
            {/* Amount */}
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            {/* Progress bar */}
            <div className="h-3 bg-gray-200 rounded-full" />
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-6 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
            {/* CTA Button */}
            <div className="h-12 bg-gray-200 rounded-xl" />
          </div>

          {/* Reward tiers skeleton */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
