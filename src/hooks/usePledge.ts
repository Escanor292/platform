"use client";

import { useCallback, useState } from "react";
import type { CreatePledgeInput } from "@/types/pledge";

interface UsePledgeReturn {
  loading: boolean;
  error: string | null;
  paymentUrl: string | null;
  pledgeId: string | null;
  submitPledge: (input: CreatePledgeInput) => Promise<void>;
  reset: () => void;
}

/**
 * Hook xử lý luồng ủng hộ campaign:
 * 1. Gọi API tạo pledge
 * 2. Nhận payment URL → redirect hoặc hiện QR
 * 3. Trả về pledgeId để tracking
 */
export function usePledge(): UsePledgeReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [pledgeId, setPledgeId] = useState<string | null>(null);

  const submitPledge = useCallback(async (input: CreatePledgeInput) => {
    setLoading(true);
    setError(null);
    setPaymentUrl(null);
    setPledgeId(null);

    try {
      const res = await fetch("/api/payments/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi khi xử lý ủng hộ");

      if (data.pledgeId) setPledgeId(data.pledgeId);

      if (data.paymentUrl) {
        setPaymentUrl(data.paymentUrl);
        window.location.href = data.paymentUrl;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể kết nối, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setPaymentUrl(null);
    setPledgeId(null);
  }, []);

  return { loading, error, paymentUrl, pledgeId, submitPledge, reset };
}

/**
 * Hook tra cứu lịch sử ủng hộ của backer (sau khi login)
 */
export function useBackerHistory(userId?: string) {
  const [pledges, setPledges] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/pledges?userId=${userId}`);
      if (!res.ok) throw new Error("Không thể tải lịch sử ủng hộ");
      const data = await res.json();
      setPledges(data.pledges ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { pledges, loading, error, fetchHistory };
}
