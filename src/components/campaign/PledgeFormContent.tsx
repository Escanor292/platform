"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatVND } from "@/lib/utils";
import SePayQRModal from "@/components/payment/SePayQRModal";

interface Reward {
    id: string;
    title: string;
    description?: string | null;
    minAmount: number;
    estimatedDelivery?: string | null;
}

interface PledgeFormContentProps {
    campaignId: string;
    campaignSlug?: string;
    rewards?: Reward[];
    donationType?: 'general' | 'reward';
    preselectedReward?: Reward | null;
    showHeader?: boolean;
}

const PLATFORM_TIP_OPTIONS = [0, 5, 10, 15];

// Payment methods configuration with brand colors
const PAYMENT_METHODS = {
    PAYOS: {
        id: "PAYOS",
        label: "🏦 PayOS",
        description: "Ví điện tử & VietQR",
        colors: {
            border: "border-purple-500",
            bg: "bg-purple-50",
            text: "text-purple-700",
            button: "from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
            accent: "purple"
        }
    },
    SEPAY: {
        id: "SEPAY",
        label: "📱 SePay (QR)",
        description: "Chuyển khoản nhanh",
        colors: {
            border: "border-cyan-500",
            bg: "bg-cyan-50",
            text: "text-cyan-700",
            button: "from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700",
            accent: "cyan"
        }
    },
    VNPAY: {
        id: "VNPAY",
        label: "💳 VNPay",
        description: "ATM & Visa/Master",
        colors: {
            border: "border-blue-600",
            bg: "bg-blue-50",
            text: "text-blue-700",
            button: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
            accent: "blue"
        }
    },
    MOMO: {
        id: "MOMO",
        label: "🟣 MoMo",
        description: "Ví MoMo",
        colors: {
            border: "border-pink-500",
            bg: "bg-pink-50",
            text: "text-pink-700",
            button: "from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700",
            accent: "pink"
        }
    }
} as const;

const PledgeFormContent = memo(function PledgeFormContent({
    campaignId,
    campaignSlug,
    rewards = [],
    donationType = 'general',
    preselectedReward,
    showHeader = true,
}: PledgeFormContentProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // SePay modal state
    const [showSePayModal, setShowSePayModal] = useState(false);
    const [sePayData, setSePayData] = useState<any>(null);

    const [selectedRewardId, setSelectedRewardId] = useState<string | null>(
        preselectedReward?.id ?? null
    );
    const [customAmount, setCustomAmount] = useState(
        preselectedReward?.minAmount ? Number(preselectedReward.minAmount) : 100000
    );
    const [displayCustomAmount, setDisplayCustomAmount] = useState("100.000");
    const [tipPercent, setTipPercent] = useState(5);
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Guest user fields - only used when not authenticated
    const [displayName, setDisplayName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");

    const [paymentMethod, setPaymentMethod] = useState<"VNPAY" | "MOMO" | "PAYOS" | "SEPAY">("PAYOS");

    // Auth state checks
    const isAuthenticated = status === "authenticated" && session?.user;
    const isLoading = status === "loading";
    const currentUser = session?.user;

    // Donation type logic
    const isRewardDonation = donationType === 'reward';
    const isGeneralDonation = donationType === 'general';

    // For reward donation, lock the reward selection
    const effectiveSelectedRewardId = isRewardDonation ? preselectedReward?.id || null : selectedRewardId;
    const effectiveRewards = isGeneralDonation ? [] : rewards; // Hide rewards for general donation

    const formatAmountInput = (value: string) => {
        const numericValue = value.replace(/\D/g, "");
        if (!numericValue) return "";
        return Number(numericValue).toLocaleString("de-DE");
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formatted = formatAmountInput(rawValue);
        const numeric = Number(rawValue.replace(/\D/g, ""));

        setDisplayCustomAmount(formatted);
        setCustomAmount(numeric);
    };

    const selectedReward = useMemo(
        () => rewards.find((r) => r.id === effectiveSelectedRewardId),
        [rewards, effectiveSelectedRewardId]
    );

    // Check if shipping address is needed for reward donation (after selectedReward is defined)
    const needsShippingAddress = isRewardDonation && selectedReward;
    const userHasShippingAddress = isAuthenticated && (currentUser as any)?.shippingAddress;
    const shouldShowShippingForm = needsShippingAddress && (!userHasShippingAddress || !isAuthenticated);

    // Helper function to get RGB colors for gradients
    const getSliderColors = (accent: string) => {
        switch (accent) {
            case 'purple':
                return { primary: 'rgb(147 51 234)', secondary: 'rgb(168 85 247)' }; // purple-600, purple-500
            case 'cyan':
                return { primary: 'rgb(8 145 178)', secondary: 'rgb(34 211 238)' }; // cyan-600, cyan-400
            case 'blue':
                return { primary: 'rgb(37 99 235)', secondary: 'rgb(59 130 246)' }; // blue-600, blue-500
            case 'pink':
                return { primary: 'rgb(219 39 119)', secondary: 'rgb(236 72 153)' }; // pink-600, pink-500
            default:
                return { primary: 'rgb(79 70 229)', secondary: 'rgb(99 102 241)' }; // indigo-600, indigo-500
        }
    };

    const currentMethod = PAYMENT_METHODS[paymentMethod];
    const sliderColors = getSliderColors(currentMethod.colors.accent);

    const baseAmount = selectedReward ? selectedReward.minAmount : customAmount;
    const tipAmount = useMemo(
        () => Math.round((baseAmount * tipPercent) / 100),
        [baseAmount, tipPercent]
    );
    const totalAmount = baseAmount + tipAmount;

    // For reward donation, use the reward's minimum amount
    const finalAmount = isRewardDonation && selectedReward
        ? Number(selectedReward.minAmount)
        : customAmount;

    const finalTipAmount = useMemo(
        () => Math.round((finalAmount * tipPercent) / 100),
        [finalAmount, tipPercent]
    );
    const finalTotalAmount = finalAmount + finalTipAmount;

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Validation for reward donations
            if (needsShippingAddress && !userHasShippingAddress && !shippingAddress.trim()) {
                setError("Vui lòng nhập địa chỉ nhận hàng để nhận phần quà");
                setLoading(false);
                return;
            }

            // Email validation for reward donations (guest users)
            if (needsShippingAddress && !isAuthenticated && !guestEmail.trim()) {
                setError("Vui lòng nhập email để nhận thông tin giao hàng");
                setLoading(false);
                return;
            }
            // Prepare payload based on auth status
            const payload = {
                campaignId,
                rewardId: isRewardDonation ? effectiveSelectedRewardId : undefined,
                amount: finalAmount,
                platformTipPercent: tipPercent,
                isAnonymous,
                paymentMethod,
                // Use session data for authenticated users, form data for guests
                displayName: isAnonymous
                    ? undefined
                    : isAuthenticated
                        ? currentUser?.name || undefined
                        : displayName || undefined,
                guestEmail: isAuthenticated
                    ? currentUser?.email || undefined
                    : guestEmail || undefined,
                // Include shipping address for reward donations
                shippingAddress: needsShippingAddress
                    ? (userHasShippingAddress ? (currentUser as any)?.shippingAddress : shippingAddress)
                    : undefined,
            };

            const res = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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
    }, [
        campaignId,
        effectiveSelectedRewardId,
        finalAmount,
        tipPercent,
        isAnonymous,
        paymentMethod,
        router,
        isAuthenticated,
        currentUser,
        displayName,
        guestEmail,
        isRewardDonation,
        needsShippingAddress,
        userHasShippingAddress,
        shippingAddress
    ]);

    return (
        <div className={showHeader ? "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden" : ""}>
            {showHeader && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                    <h2 className="text-white font-bold text-xl">💜 Ủng hộ dự án</h2>
                    <p className="text-indigo-100 text-sm mt-1">
                        Hỗ trợ nhà sáng tạo biến ý tưởng thành hiện thực
                    </p>
                </div>
            )}

            {/* Show loading state while auth is resolving */}
            {isLoading ? (
                <div className={showHeader ? "p-6" : ""}>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2 text-gray-600">Đang tải...</span>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className={showHeader ? "p-6 space-y-6" : "space-y-6"}>
                    {error && (
                        <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Reward Selection - Only show for general donation or display selected reward for reward donation */}
                    {isRewardDonation && selectedReward ? (
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">Phần quà đã chọn</label>
                            <div className="p-4 border-2 border-emerald-500 bg-emerald-50 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{selectedReward.title}</p>
                                        <p className="text-sm font-semibold text-emerald-600">{formatVND(selectedReward.minAmount)}</p>
                                        {selectedReward.description && (
                                            <p className="text-xs text-gray-600 mt-1">{selectedReward.description}</p>
                                        )}
                                        {selectedReward.estimatedDelivery && (
                                            <p className="text-xs text-gray-500 mt-1">📦 Giao hàng: {selectedReward.estimatedDelivery}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : isGeneralDonation ? (
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">Ủng hộ không quà</label>
                            <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">Ủng hộ dự án với số tiền tùy chọn</p>
                                </div>
                            </div>
                        </div>
                    ) : effectiveRewards.length > 0 ? (
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
                                {effectiveRewards.map((r) => (
                                    <label
                                        key={r.id}
                                        className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition ${selectedRewardId === r.id
                                            ? `${currentMethod.colors.accent === 'purple' ? 'border-purple-500 bg-purple-50' :
                                                currentMethod.colors.accent === 'cyan' ? 'border-cyan-500 bg-cyan-50' :
                                                    currentMethod.colors.accent === 'blue' ? 'border-blue-500 bg-blue-50' :
                                                        currentMethod.colors.accent === 'pink' ? 'border-pink-500 bg-pink-50' : 'border-indigo-500 bg-indigo-50'
                                            }`
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
                                            <p className={`text-xs font-semibold ${currentMethod.colors.accent === 'purple' ? 'text-purple-600' :
                                                currentMethod.colors.accent === 'cyan' ? 'text-cyan-600' :
                                                    currentMethod.colors.accent === 'blue' ? 'text-blue-600' :
                                                        currentMethod.colors.accent === 'pink' ? 'text-pink-600' : 'text-indigo-600'
                                                }`}>{formatVND(r.minAmount)}+</p>
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
                    ) : null}

                    {/* Số tiền ủng hộ - Only show for general donation or when no reward selected */}
                    {(isGeneralDonation || (!selectedRewardId && !isRewardDonation)) && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Số tiền ủng hộ (VNĐ)
                            </label>
                            <input
                                type="text"
                                value={displayCustomAmount}
                                onChange={handleCustomAmountChange}
                                placeholder="100.000"
                                className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none ${currentMethod.colors.accent === 'purple' ? 'focus:ring-purple-500' :
                                    currentMethod.colors.accent === 'cyan' ? 'focus:ring-cyan-500' :
                                        currentMethod.colors.accent === 'blue' ? 'focus:ring-blue-500' :
                                            currentMethod.colors.accent === 'pink' ? 'focus:ring-pink-500' : 'focus:ring-indigo-500'
                                    }`}
                            />
                            <div className="flex gap-2 mt-2">
                                {[100000, 200000, 500000, 1000000].map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => {
                                            setCustomAmount(amt);
                                            setDisplayCustomAmount(amt.toLocaleString("de-DE"));
                                        }}
                                        className={`text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 transition ${currentMethod.colors.accent === 'purple' ? 'hover:bg-purple-50 hover:border-purple-300' :
                                            currentMethod.colors.accent === 'cyan' ? 'hover:bg-cyan-50 hover:border-cyan-300' :
                                                currentMethod.colors.accent === 'blue' ? 'hover:bg-blue-50 hover:border-blue-300' :
                                                    currentMethod.colors.accent === 'pink' ? 'hover:bg-pink-50 hover:border-pink-300' : 'hover:bg-indigo-50 hover:border-indigo-300'
                                            }`}
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
                                    className={`flex-1 text-sm py-2 rounded-lg border transition ${tipPercent === pct
                                        ? `${currentMethod.colors.accent === 'purple' ? 'bg-purple-600 text-white border-purple-600' :
                                            currentMethod.colors.accent === 'cyan' ? 'bg-cyan-600 text-white border-cyan-600' :
                                                currentMethod.colors.accent === 'blue' ? 'bg-blue-600 text-white border-blue-600' :
                                                    currentMethod.colors.accent === 'pink' ? 'bg-pink-600 text-white border-pink-600' : 'bg-indigo-600 text-white border-indigo-600'
                                        }`
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
                                    className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${currentMethod.colors.accent === 'purple' ? 'accent-purple-600' :
                                        currentMethod.colors.accent === 'cyan' ? 'accent-cyan-600' :
                                            currentMethod.colors.accent === 'blue' ? 'accent-blue-600' :
                                                currentMethod.colors.accent === 'pink' ? 'accent-pink-600' : 'accent-indigo-600'
                                        }`}
                                    style={{
                                        background: `linear-gradient(to right, ${sliderColors.primary} 0%, ${sliderColors.primary} ${Math.min(tipPercent, 100)}%, rgb(229 231 235) ${Math.min(tipPercent, 100)}%, rgb(229 231 235) 100%)`
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
                                        className={`w-16 px-2 py-1 text-center text-sm font-bold border border-gray-200 rounded-lg focus:ring-2 outline-none ${currentMethod.colors.accent === 'purple' ? 'text-purple-600 focus:ring-purple-500' :
                                            currentMethod.colors.accent === 'cyan' ? 'text-cyan-600 focus:ring-cyan-500' :
                                                currentMethod.colors.accent === 'blue' ? 'text-blue-600 focus:ring-blue-500' :
                                                    currentMethod.colors.accent === 'pink' ? 'text-pink-600 focus:ring-pink-500' : 'text-indigo-600 focus:ring-indigo-500'
                                            }`}
                                    />
                                    <span className="text-sm font-medium text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Anonymous checkbox - always visible */}
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

                        {/* Display name input - only for guests when not anonymous */}
                        {!isAuthenticated && !isAnonymous && (
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Tên hiển thị (để trống dùng tên tài khoản)"
                                className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none ${currentMethod.colors.accent === 'purple' ? 'focus:ring-purple-500' :
                                    currentMethod.colors.accent === 'cyan' ? 'focus:ring-cyan-500' :
                                        currentMethod.colors.accent === 'blue' ? 'focus:ring-blue-500' :
                                            currentMethod.colors.accent === 'pink' ? 'focus:ring-pink-500' : 'focus:ring-indigo-500'
                                    }`}
                            />
                        )}

                        {/* Show current user info for authenticated users */}
                        {isAuthenticated && !isAnonymous && (
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                <div className="text-sm text-gray-600 mb-1">Thông tin tài khoản:</div>
                                <div className="text-sm font-medium text-gray-900">{currentUser?.name || "Chưa có tên"}</div>
                                <div className="text-xs text-gray-500">{currentUser?.email || "Chưa có email"}</div>
                            </div>
                        )}
                    </div>

                    {/* Email input - for guests or required for reward donations */}
                    {(!isAuthenticated || needsShippingAddress) && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                {needsShippingAddress ? "Email nhận thông tin giao hàng *" : "Email nhận xác nhận (không bắt buộc)"}
                            </label>
                            <input
                                type="email"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                placeholder={needsShippingAddress ? "Email để nhận thông tin giao hàng..." : "Email để nhận xác nhận..."}
                                required={needsShippingAddress && !isAuthenticated}
                                className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none ${currentMethod.colors.accent === 'purple' ? 'focus:ring-purple-500' :
                                    currentMethod.colors.accent === 'cyan' ? 'focus:ring-cyan-500' :
                                        currentMethod.colors.accent === 'blue' ? 'focus:ring-blue-500' :
                                            currentMethod.colors.accent === 'pink' ? 'focus:ring-pink-500' : 'focus:ring-indigo-500'
                                    }`}
                            />
                        </div>
                    )}

                    {/* Shipping Address - only for reward donations when needed */}
                    {shouldShowShippingForm && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Địa chỉ nhận hàng *
                            </label>
                            <textarea
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                placeholder="Nhập địa chỉ đầy đủ để nhận phần quà..."
                                rows={3}
                                required
                                className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none resize-none ${currentMethod.colors.accent === 'purple' ? 'focus:ring-purple-500' :
                                    currentMethod.colors.accent === 'cyan' ? 'focus:ring-cyan-500' :
                                        currentMethod.colors.accent === 'blue' ? 'focus:ring-blue-500' :
                                            currentMethod.colors.accent === 'pink' ? 'focus:ring-pink-500' : 'focus:ring-indigo-500'
                                    }`}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM
                            </p>
                        </div>
                    )}

                    {/* Show existing shipping address for authenticated users */}
                    {needsShippingAddress && userHasShippingAddress && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Địa chỉ nhận hàng
                            </label>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                                <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-800">Sử dụng địa chỉ đã lưu</p>
                                        <p className="text-sm text-green-700 mt-1">{(currentUser as any)?.shippingAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Phương thức thanh toán */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phương thức thanh toán
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.values(PAYMENT_METHODS).map((method) => {
                                const isSelected = paymentMethod === method.id;
                                return (
                                    <label
                                        key={method.id}
                                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer text-sm transition-all duration-200 ${isSelected
                                            ? `${method.colors.border} ${method.colors.bg} ${method.colors.text} font-medium shadow-sm`
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={isSelected}
                                                onChange={() => setPaymentMethod(method.id as any)}
                                                className="hidden"
                                            />
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected
                                                ? `${method.colors.border} ${method.colors.bg}`
                                                : "border-gray-300"
                                                }`}>
                                                {isSelected && (
                                                    <div className={`w-2 h-2 rounded-full ${method.colors.accent === 'purple' ? 'bg-purple-600' :
                                                        method.colors.accent === 'cyan' ? 'bg-cyan-600' :
                                                            method.colors.accent === 'blue' ? 'bg-blue-600' :
                                                                method.colors.accent === 'pink' ? 'bg-pink-600' : 'bg-gray-600'
                                                        }`} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{method.label}</div>
                                                <div className={`text-xs ${isSelected ? 'opacity-80' : 'text-gray-500'}`}>
                                                    {method.description}
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${method.colors.accent === 'purple' ? 'bg-purple-100' :
                                                method.colors.accent === 'cyan' ? 'bg-cyan-100' :
                                                    method.colors.accent === 'blue' ? 'bg-blue-100' :
                                                        method.colors.accent === 'pink' ? 'bg-pink-100' : 'bg-gray-100'
                                                }`}>
                                                <svg className={`w-3 h-3 ${method.colors.accent === 'purple' ? 'text-purple-600' :
                                                    method.colors.accent === 'cyan' ? 'text-cyan-600' :
                                                        method.colors.accent === 'blue' ? 'text-blue-600' :
                                                            method.colors.accent === 'pink' ? 'text-pink-600' : 'text-gray-600'
                                                    }`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tổng kết */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Số tiền ủng hộ</span>
                            <span>{formatVND(finalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tip nền tảng ({tipPercent}%)</span>
                            <span>{formatVND(finalTipAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Tổng cộng</span>
                            <span className={`${PAYMENT_METHODS[paymentMethod].colors.accent === 'purple' ? 'text-purple-600' :
                                PAYMENT_METHODS[paymentMethod].colors.accent === 'cyan' ? 'text-cyan-600' :
                                    PAYMENT_METHODS[paymentMethod].colors.accent === 'blue' ? 'text-blue-600' :
                                        PAYMENT_METHODS[paymentMethod].colors.accent === 'pink' ? 'text-pink-600' : 'text-indigo-600'
                                }`}>{formatVND(finalTotalAmount)}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || baseAmount < 50000}
                        className={`w-full bg-gradient-to-r ${PAYMENT_METHODS[paymentMethod].colors.button} disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
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
            )}

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

export default PledgeFormContent;