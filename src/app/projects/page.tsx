"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CampaignFilters, CampaignListResponse, SortOption } from "@/types/campaign";
import { parseCampaignFilters, filtersToSearchParams } from "@/lib/campaign-query-params";
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
import { SlidersHorizontal } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<CampaignListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const filters = useMemo(() => {
    const parsed = parseCampaignFilters(searchParams);
    return { ...parsed, q: debouncedSearchQuery || undefined };
  }, [searchParams, debouncedSearchQuery]);

  const queryString = useMemo(() => {
    const params = filtersToSearchParams(filters);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/campaigns?${queryString}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (isMounted) {
          setData(result);
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

  const updateFilters = useCallback((newFilters: Partial<CampaignFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    const params = filtersToSearchParams(updated);
    router.push(`/projects?${params.toString()}`);
  }, [filters, router]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery !== (searchParams.get('q') || '')) {
      updateFilters({ q: debouncedSearchQuery || undefined });
    }
  }, [debouncedSearchQuery]);

  const handleSort = useCallback((sort: SortOption) => {
    updateFilters({ sort });
  }, [updateFilters]);

  const handleRemoveFilter = useCallback((key: keyof CampaignFilters) => {
    updateFilters({ [key]: undefined });
  }, [updateFilters]);

  const handleClearAllFilters = useCallback(() => {
    router.push("/projects");
  }, [router]);

  const handleApplyAdvancedFilters = useCallback((newFilters: Partial<CampaignFilters>) => {
    updateFilters(newFilters);
  }, [updateFilters]);

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
      <section
        className="relative overflow-hidden px-6 pt-28 pb-16 md:pt-32 md:pb-20"
        style={{
          background: 'linear-gradient(180deg, #F8F7F2 0%, #f0f8f4 50%, #F8F7F2 100%)'
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[5%] top-10 h-80 w-80 rounded-full bg-gradient-to-br from-pgreen/20 via-pgreen/8 to-transparent blur-3xl opacity-70" />
          <div className="absolute right-[8%] top-32 h-80 w-80 rounded-full bg-gradient-to-tl from-tblue/15 via-transparent to-transparent blur-3xl opacity-60" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl overflow-visible">
          <div className="mb-10 text-center">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/55 px-5 py-2.5 text-xs font-bold text-pgreen shadow-lg backdrop-blur-md">
              Khám phá cộng đồng
            </div>
            <h1 className="font-display mb-5 font-black text-4xl text-dblue md:text-5xl lg:text-6xl">
              Khám phá <span className="bg-gradient-to-r from-pgreen via-fgreen to-tblue bg-clip-text text-transparent">chiến dịch</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
              Tìm kiếm và đồng hành cùng những chiến dịch tử tế đang tạo tác động tích cực.
            </p>
          </div>

          <div className="relative z-40 mx-auto max-w-4xl overflow-visible">
            <div className="glass rounded-3xl p-5 shadow-soft md:p-6">
              <div className="flex flex-col gap-4 md:flex-row">
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
                    className="flex h-12 items-center gap-2 whitespace-nowrap rounded-xl border-2 border-pgreen/20 px-6 font-bold text-dblue transition-colors hover:border-pgreen/40 hover:text-pgreen"
                  >
                    <SlidersHorizontal size={18} />
                    <span className="hidden sm:inline">Bộ lọc</span>
                  </button>
                </div>
              </div>

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

      <div className="mx-auto max-w-7xl px-6 py-8">
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

        {isLoading && (
          <CampaignGridSkeleton count={12} />
        )}

        {!isLoading && data && data.items.length === 0 && (
          <CampaignEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearAllFilters}
          />
        )}

        {!isLoading && data && data.items.length > 0 && (
          <>
            <CampaignGrid projects={data.items} />

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
