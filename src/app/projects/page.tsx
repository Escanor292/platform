"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CampaignFilters, CampaignListResponse, SortOption } from "@/types/campaign";
import { parseCampaignFilters, filtersToSearchParams } from "@/lib/campaign-query-params";
import { campaignCache } from "@/lib/campaign-cache";
import { useDebounce } from "@/hooks/useDebounce";
import { CampaignSearchBar } from "@/components/campaigns/CampaignSearchBar";
import { CampaignSortSelect } from "@/components/campaigns/CampaignSortSelect";
import { CampaignFilterChips } from "@/components/campaigns/CampaignFilterChips";
import { CampaignAdvancedFilters } from "@/components/campaigns/CampaignAdvancedFilters";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";
import { CampaignEmptyState } from "@/components/campaigns/CampaignEmptyState";
import { CampaignResultsHeader } from "@/components/campaigns/CampaignResultsHeader";
import { CampaignPagination } from "@/components/campaigns/CampaignPagination";
import { CampaignGridSkeleton } from "@/components/campaigns/CampaignCardSkeleton";
import { SlidersHorizontal, Loader2 } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<CampaignListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Debounce search query để giảm số lần fetch
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Memoize filters to prevent unnecessary re-renders
  const filters = useMemo(() => {
    const parsed = parseCampaignFilters(searchParams);
    // Override với debounced search query
    return { ...parsed, q: debouncedSearchQuery || undefined };
  }, [searchParams, debouncedSearchQuery]);

  // Create stable query string
  const queryString = useMemo(() => {
    const params = filtersToSearchParams(filters);
    return params.toString();
  }, [filters]);

  // Fetch projects
  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      // Check cache first
      const cachedData = campaignCache.get(queryString);
      if (cachedData && isMounted) {
        setData(cachedData);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`/api/campaigns?${queryString}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (isMounted) {
          setData(result);
          campaignCache.set(queryString, result);
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error("Error fetching projects:", error);

        if (isMounted) {
          setData({
            items: [],
            total: 0,
            page: 1,
            limit: 12,
            totalPages: 0,
            appliedFilters: filters,
          });
          setIsLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [queryString, filters]);

  // Update URL with new filters
  const updateFilters = useCallback((newFilters: Partial<CampaignFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 }; // Reset to page 1 on filter change
    const params = filtersToSearchParams(updated);
    router.push(`/projects?${params.toString()}`);
  }, [filters, router]);

  // Handle search với debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // URL sẽ được update khi debouncedSearchQuery thay đổi
  }, []);

  // Update URL khi debounced search query thay đổi
  useEffect(() => {
    if (debouncedSearchQuery !== (searchParams.get('q') || '')) {
      updateFilters({ q: debouncedSearchQuery || undefined });
    }
  }, [debouncedSearchQuery]);

  // Handle sort
  const handleSort = useCallback((sort: SortOption) => {
    updateFilters({ sort });
  }, [updateFilters]);

  // Handle remove filter
  const handleRemoveFilter = useCallback((key: keyof CampaignFilters) => {
    updateFilters({ [key]: undefined });
  }, [updateFilters]);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    router.push("/projects");
  }, [router]);

  // Handle advanced filters
  const handleApplyAdvancedFilters = useCallback((newFilters: Partial<CampaignFilters>) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    const updated = { ...filters, page };
    const params = filtersToSearchParams(updated);
    router.push(`/projects?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters, router]);

  const hasActiveFilters = useMemo(() =>
    Object.keys(filters).some(
      (key) => !["page", "limit", "sort"].includes(key) && filters[key as keyof CampaignFilters] !== undefined
    ),
    [filters]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section
        className="pt-32 pb-16 px-6 relative"
        style={{
          background: 'linear-gradient(180deg, #F8F7F2 0%, #f0f8f4 50%, #F8F7F2 100%)'
        }}
      >
        {/* Background elements - separate container with overflow-hidden */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div
            className="absolute top-10 left-[5%] w-96 h-96 bg-gradient-to-br from-fgreen/20 via-fgreen/8 to-transparent rounded-full blur-3xl opacity-70"
            style={{ animation: 'pulse 8s ease-in-out infinite' }}
          />
          <div
            className="absolute top-32 right-[8%] w-80 h-80 bg-gradient-to-tl from-tblue/15 via-transparent to-transparent rounded-full blur-3xl opacity-60"
            style={{ animation: 'pulse 10s ease-in-out 2s infinite' }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 overflow-visible">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-md bg-white/55 border border-white/70 text-pgreen text-xs font-bold mb-6 shadow-lg">
              Khám phá cộng đồng
            </div>
            <h1 className="font-display font-black text-4xl lg:text-6xl text-dblue mb-5">
              Khám phá chiến dịch
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 leading-relaxed">
              Tìm kiếm và đồng hành cùng những chiến dịch tử tế đang tạo tác động tích cực.
            </p>
          </div>

          {/* Search and Sort */}
          <div className="max-w-4xl mx-auto relative z-40 overflow-visible">
            <div className="glass rounded-3xl p-6 shadow-soft">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <CampaignSearchBar
                    value={searchQuery}
                    onChange={handleSearch}
                    onClear={() => handleSearch("")}
                  />
                </div>
                <div className="flex gap-3">
                  <CampaignSortSelect
                    value={filters.sort || "newest"}
                    onChange={handleSort}
                  />
                  <button
                    onClick={() => setShowAdvancedFilters(true)}
                    className="h-12 px-6 rounded-xl border-2 border-pgreen/20 font-bold text-dblue hover:border-pgreen/40 hover:text-pgreen transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <SlidersHorizontal size={18} />
                    <span className="hidden sm:inline">Bộ lọc</span>
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mt-4">
                  <CampaignFilterChips
                    filters={filters}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAll={handleClearAllFilters}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Results Header */}
        {data && (
          <div className="mb-8">
            <CampaignResultsHeader
              total={data.total}
              page={data.page}
              limit={data.limit}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <CampaignGridSkeleton count={12} />
        )}

        {/* Empty State */}
        {!isLoading && data && data.items.length === 0 && (
          <CampaignEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearAllFilters}
          />
        )}

        {/* Campaign Grid */}
        {!isLoading && data && data.items.length > 0 && (
          <>
            <CampaignGrid projects={data.items} />

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-12">
                <CampaignPagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Advanced Filters Drawer */}
      {showAdvancedFilters && (
        <CampaignAdvancedFilters
          filters={filters}
          onApply={handleApplyAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
        />
      )}
    </div>
  );
}
