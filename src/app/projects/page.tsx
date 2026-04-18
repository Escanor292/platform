"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectFilters, ProjectListResponse, SortOption } from "@/types/project";
import { parseProjectFilters, filtersToSearchParams } from "@/lib/project-query-params";
import { projectCache } from "@/lib/project-cache";
import { useDebounce } from "@/hooks/useDebounce";
import { ProjectSearchBar } from "@/components/projects/ProjectSearchBar";
import { ProjectSortSelect } from "@/components/projects/ProjectSortSelect";
import { ProjectFilterChips } from "@/components/projects/ProjectFilterChips";
import { ProjectAdvancedFilters } from "@/components/projects/ProjectAdvancedFilters";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { ProjectEmptyState } from "@/components/projects/ProjectEmptyState";
import { ProjectResultsHeader } from "@/components/projects/ProjectResultsHeader";
import { ProjectPagination } from "@/components/projects/ProjectPagination";
import { ProjectGridSkeleton } from "@/components/projects/ProjectCardSkeleton";
import { SlidersHorizontal, Loader2 } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<ProjectListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  // Debounce search query để giảm số lần fetch
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Memoize filters to prevent unnecessary re-renders
  const filters = useMemo(() => {
    const parsed = parseProjectFilters(searchParams);
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
      const cachedData = projectCache.get(queryString);
      if (cachedData && isMounted) {
        setData(cachedData);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/projects?${queryString}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          projectCache.set(queryString, result);
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
  const updateFilters = useCallback((newFilters: Partial<ProjectFilters>) => {
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
  const handleRemoveFilter = useCallback((key: keyof ProjectFilters) => {
    updateFilters({ [key]: undefined });
  }, [updateFilters]);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    router.push("/projects");
  }, [router]);

  // Handle advanced filters
  const handleApplyAdvancedFilters = useCallback((newFilters: Partial<ProjectFilters>) => {
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
      (key) => !["page", "limit", "sort"].includes(key) && filters[key as keyof ProjectFilters] !== undefined
    ),
    [filters]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Khám phá dự án
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tìm kiếm và ủng hộ các dự án sáng tạo, ý nghĩa từ cộng đồng
            </p>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <ProjectSearchBar
                value={searchQuery}
                onChange={handleSearch}
                onClear={() => handleSearch("")}
              />
            </div>
            <div className="flex gap-3">
              <ProjectSortSelect
                value={filters.sort || "newest"}
                onChange={handleSort}
              />
              <button
                onClick={() => setShowAdvancedFilters(true)}
                className="h-12 px-6 rounded-xl border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <ProjectFilterChips
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Results Header */}
        {data && (
          <div className="mb-8">
            <ProjectResultsHeader
              total={data.total}
              page={data.page}
              limit={data.limit}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <ProjectGridSkeleton count={12} />
        )}

        {/* Empty State */}
        {!isLoading && data && data.items.length === 0 && (
          <ProjectEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearAllFilters}
          />
        )}

        {/* Project Grid */}
        {!isLoading && data && data.items.length > 0 && (
          <>
            <ProjectGrid projects={data.items} />

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-12">
                <ProjectPagination
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
        <ProjectAdvancedFilters
          filters={filters}
          onApply={handleApplyAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
        />
      )}
    </div>
  );
}
