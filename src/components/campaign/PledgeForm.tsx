"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { formatVND } from "@/lib/utils";
import SePayQRModal from "@/components/payment/SePayQRModal";

interface Reward {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  estimatedDelivery?: string | null;
}

interface PledgeFormProps {
  campaignId: string;
  campaignSlug?: string;
  rewards?: Reward[];
  preselectedRewardId?: string;
}

const PLATFORM_TIP_OPTIONS = [0, 5, 10, 15];

const PledgeForm = memo(function PledgeForm({
  campaignId,
  campaignSlug,
  rewards = [],
  preselectedRewardId,
}: PledgeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // SePay modal state
  const [showSePayModal, setShowSePayModal] = useState(false);
  const [sePayData, setSePayData] = useState<any>(null);

  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(
    preselectedRewardId ?? null
  );
  const [customAmount, setCustomAmount] = useState(100000);
  const [tipPercent, setTipPercent] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"VNPAY" | "MOMO" | "PAYOS" | "SEPAY" | "BANK">("PAYOS");

  const selectedReward = useMemo(
    () => rewards.find((r) => r.id === selectedRewardId),
    [rewards, selectedRewardId]
  );
  
  const baseAmount = selectedReward ? selectedReward.amount : customAmount;
  const tipAmount = useMemo(
    () => Math.round((baseAmount * tipPercent) / 100),
    [baseAmount, tipPercent]
  );
  const totalAmount = baseAmount + tipAmount;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          rewardId: selectedRewardId ?? undefined,
          amount: baseAmount,
          platformTipPercent: tipPercent,
          isAnonymous,
          displayName: isAnonymous ? undefined : displayName || undefined,
          guestEmail: guestEmail || undefined,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      // Xử lý SePay (hiển thị QR modal)
      if (data.paymentMethod === "SEPAY") {
        setSePayData(data);
        setShowSePayModal(true);
        return;
      }

      // Xử lý các payment gateway khác (redirect)
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.pledgeId) {
        router.push(`/payment-success?pledgeId=${data.pledgeId}&status=success`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi khi xử lý ủng hộ");
    } finally {
      setLoading(false);
    }
  }, [campaignId, selectedRewardId, baseAmount, tipPercent, isAnonymous, displayName, guestEmail, paymentMethod, router]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
        <h2 className="text-white font-bold text-xl">💜 Ủng hộ dự án</h2>
        <p className="text-indigo-100 text-sm mt-1">
          Hỗ trợ nhà sáng tạo biến ý tưởng thành hiện thực
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Chọn mức ủng hộ */}
        {rewards.length > 0 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Chọn phần thưởng</label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="reward"
                  value=""
                  checked={!selectedRewardId}
                  onChange={() => setSelectedRewardId(null)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">Ủng hộ tự chọn</p>
                  <p className="text-xs text-gray-500">Nhập số tiền bất kỳ</p>
                </div>
              </label>
              {rewards.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition ${
                    selectedRewardId === r.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="reward"
                    value={r.id}
                    checked={selectedRewardId === r.id}
                    onChange={() => setSelectedRewardId(r.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.title}</p>
                    <p className="text-xs text-indigo-600 font-semibold">{formatVND(r.amount)}+</p>
                    {r.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                    )}
                    {r.estimatedDelivery && (
                      <p className="text-xs text-gray-400">📦 {r.estimatedDelivery}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Số tiền ủng hộ */}
        {!selectedRewardId && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Số tiền ủng hộ (VNĐ)
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              min={50000}
              step={50000}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="flex gap-2 mt-2">
              {[100000, 200000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCustomAmount(amt)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50 hover:border-indigo-300 transition"
                >
                  {formatVND(amt)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tip hỗ trợ nền tảng */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tip hỗ trợ nền tảng (tùy chọn)
          </label>
          <div className="flex gap-2 mb-3">
            {PLATFORM_TIP_OPTIONS.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setTipPercent(pct)}
                className={`flex-1 text-sm py-2 rounded-lg border transition ${
                  tipPercent === pct
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {pct === 0 ? "Không" : `${pct}%`}
              </button>
            ))}
          </div>
          
          {/* Slider và Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={Math.min(tipPercent, 100)}
                onChange={(e) => setTipPercent(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                style={{
                  background: `linear-gradient(to right, rgb(79 70 229) 0%, rgb(79 70 229) ${Math.min(tipPercent, 100)}%, rgb(229 231 235) ${Math.min(tipPercent, 100)}%, rgb(229 231 235) 100%)`
                }}
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={tipPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 0 && val <= 1000) {
                      setTipPercent(val);
                    }
                  }}
                  className="w-16 px-2 py-1 text-center text-sm font-bold text-indigo-600 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-sm font-medium text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hiển thị tên */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Ủng hộ ẩn danh</span>
          </label>
          {!isAnonymous && (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tên hiển thị (để trống dùng tên tài khoản)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          )}
        </div>

        {/* Email cho guest */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email nhận xác nhận (không bắt buộc)
          </label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="Email để nhận xác nhận..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Phương thức thanh toán */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phương thức thanh toán
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["PAYOS", "SEPAY", "VNPAY", "MOMO"] as const).map((method) => (
              <label
                key={method}
                className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer text-sm transition ${
                  paymentMethod === method
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                  className="hidden"
                />
                {method === "PAYOS" && "🏦 PayOS"}
                {method === "SEPAY" && "📱 SePay (QR)"}
                {method === "VNPAY" && "💳 VNPay"}
                {method === "MOMO" && "🟣 MoMo"}
              </label>
            ))}
          </div>
        </div>

        {/* Tổng kết */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Số tiền ủng hộ</span>
            <span>{formatVND(baseAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tip nền tảng ({tipPercent}%)</span>
            <span>{formatVND(tipAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Tổng cộng</span>
            <span className="text-indigo-600">{formatVND(totalAmount)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || baseAmount < 50000}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Đang xử lý...
            </>
          ) : (
            `Ủng hộ ${formatVND(totalAmount)} →`
          )}
        </button>

        <p className="text-xs text-center text-gray-400">
          🔒 Thanh toán bảo mật. Tiền giữ escrow, hoàn tiền nếu không đạt mục tiêu.
        </p>
      </form>

      {/* SePay QR Modal */}
      {showSePayModal && sePayData && (
        <SePayQRModal
          isOpen={showSePayModal}
          onClose={() => setShowSePayModal(false)}
          qrCode={sePayData.qrCode}
          bankInfo={sePayData.bankInfo}
          pledgeId={sePayData.pledgeId}
          onSuccess={() => {
            setShowSePayModal(false);
            router.push(`/payment-success?pledgeId=${sePayData.pledgeId}&status=success&method=sepay`);
          }}
        />
      )}
    </div>
  );
});

export default PledgeForm;
