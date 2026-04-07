"use client";

import { useCallback, useEffect, useState } from "react";
import type { CampaignCard, CampaignDetail, CampaignFilterParams } from "@/types/campaign";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseCampaignListReturn {
  campaigns: CampaignCard[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook lấy danh sách campaign với filter & pagination
 */
export function useCampaignList(params: CampaignFilterParams = {}): UseCampaignListReturn {
  const [campaigns, setCampaigns] = useState<CampaignCard[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { page = 1, limit = 12, category, status = "ACTIVE", search } = params;

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      qs.set("limit", String(limit));
      if (category) qs.set("category", category);
      if (status) qs.set("status", status);
      if (search) qs.set("search", search);

      const res = await fetch(`/api/campaigns?${qs.toString()}`);
      if (!res.ok) throw new Error("Không thể tải danh sách campaign");

      const data = await res.json();
      setCampaigns(data.campaigns);
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [page, limit, category, status, search]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, pagination, loading, error, refetch: fetchCampaigns };
}

interface UseCampaignDetailReturn {
  campaign: CampaignDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook lấy chi tiết một campaign theo slug hoặc id
 */
export function useCampaignDetail(slugOrId: string): UseCampaignDetailReturn {
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!slugOrId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${encodeURIComponent(slugOrId)}`);
      if (!res.ok) throw new Error("Không tìm thấy campaign");
      const data = await res.json();
      setCampaign(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [slugOrId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { campaign, loading, error, refetch: fetchDetail };
}
