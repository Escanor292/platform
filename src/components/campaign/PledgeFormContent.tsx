"use client";

import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatVND } from "@/lib/utils";

interface Reward {
    id: string;
    title: string;
    description?: string | null;
    minAmount: number;
    estimatedDelivery?: string | null;
    availability?: "AVAILABLE" | "DEVELOPMENT";
    fulfillmentType?: "PHYSICAL" | "EMAIL" | "DOWNLOAD" | "LICENSE_KEY" | "DIGITAL_COMIC";
    maxQuantity?: number | null;
}

interface CheckoutRestorePayload {
    amount?: number;
    platformTipPercent?: number;
    isAnonymous?: boolean;
    displayName?: string | null;
    guestEmail?: string | null;
    shippingAddress?: string | null;
    paymentMethod?: "ONLINE" | "COD";
    paymentMethodId?: string | null;
    savePaymentMethod?: boolean;
    quantity?: number;
    shippingMethod?: "STANDARD" | "EXPRESS" | "EMAIL" | "DOWNLOAD";
}

interface PledgeFormContentProps {
    campaignId: string;
    campaignSlug?: string;
    rewards?: Reward[];
    donationType?: 'general' | 'reward';
    preselectedReward?: Reward | null;
    restoredPayload?: CheckoutRestorePayload | null;
    initialQuantity?: number;
    showHeader?: boolean;
}

const PLATFORM_TIP_OPTIONS = [0, 5, 10, 15];

// Một lựa chọn online duy nhất; các ví, ngân hàng và thẻ sẽ nằm trong hosted checkout của provider.
const PAYMENT_METHODS = {
    ONLINE: {
        id: "ONLINE",
        label: "Thanh toán online",
        description: "Ví điện tử, ngân hàng và thẻ qua cổng thanh toán bảo mật",
        colors: {
            border: "border-green-500",
            bg: "bg-green-50",
            text: "text-green-700",
            button: "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
            accent: "green"
        }
    },
    COD: {
        id: "COD",
        label: "Thanh toán khi nhận hàng",
        description: "Chỉ áp dụng cho sản phẩm có sẵn",
        colors: {
            border: "border-amber-500",
            bg: "bg-amber-50",
            text: "text-amber-700",
            button: "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
            accent: "amber"
        }
    }
} as const;

const PledgeFormContent = memo(function PledgeFormContent({
    campaignId,
    campaignSlug,
    rewards = [],
    donationType = 'general',
    preselectedReward,
    restoredPayload,
    initialQuantity = 1,
    showHeader = true,
}: PledgeFormContentProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
    const [savePaymentMethod, setSavePaymentMethod] = useState(false);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(Math.min(99, Math.max(1, initialQuantity)));
    const [shippingMethod, setShippingMethod] = useState<"STANDARD" | "EXPRESS" | "EMAIL" | "DOWNLOAD">(
        preselectedReward?.fulfillmentType && preselectedReward.fulfillmentType !== "PHYSICAL" ? "EMAIL" : "STANDARD"
    );
    const [savedMethods, setSavedMethods] = useState<Array<{ id: string; methodType: string; provider: string; label: string; last4: string | null; isDefault: boolean }>>([]);

    useEffect(() => {
        if (!restoredPayload) return;
        if (typeof restoredPayload.amount === "number" && Number.isFinite(restoredPayload.amount)) {
            setCustomAmount(restoredPayload.amount);
            setDisplayCustomAmount(restoredPayload.amount.toLocaleString("de-DE"));
        }
        if (typeof restoredPayload.platformTipPercent === "number" && Number.isFinite(restoredPayload.platformTipPercent)) {
            setTipPercent(restoredPayload.platformTipPercent);
        }
        if (typeof restoredPayload.isAnonymous === "boolean") setIsAnonymous(restoredPayload.isAnonymous);
        if (typeof restoredPayload.displayName === "string") setDisplayName(restoredPayload.displayName);
        if (typeof restoredPayload.guestEmail === "string") setGuestEmail(restoredPayload.guestEmail);
        if (typeof restoredPayload.shippingAddress === "string") setShippingAddress(restoredPayload.shippingAddress);
        if (restoredPayload.paymentMethod === "ONLINE" || restoredPayload.paymentMethod === "COD") {
            setPaymentMethod(restoredPayload.paymentMethod);
        }
        setSelectedPaymentMethodId(restoredPayload.paymentMethodId || null);
        if (typeof restoredPayload.savePaymentMethod === "boolean") setSavePaymentMethod(restoredPayload.savePaymentMethod);
        if (typeof restoredPayload.quantity === "number" && Number.isInteger(restoredPayload.quantity)) setQuantity(Math.min(99, Math.max(1, restoredPayload.quantity)));
        if (restoredPayload.shippingMethod) setShippingMethod(restoredPayload.shippingMethod);
    }, [restoredPayload]);

    // Auth state checks
    const isAuthenticated = status === "authenticated" && session?.user;
    const isLoading = status === "loading";
    const currentUser = session?.user;

    useEffect(() => {
        if (!isAuthenticated) {
            setSavedMethods([]);
            return;
        }

        let cancelled = false;
        fetch("/api/payment-methods")
            .then((response) => response.ok ? response.json() : { methods: [] })
            .then((data) => {
                if (!cancelled) setSavedMethods(data.methods ?? []);
            })
            .catch(() => {
                if (!cancelled) setSavedMethods([]);
            });

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

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
    const isReadyProduct = selectedReward?.availability === "AVAILABLE";

    useEffect(() => {
        if (!selectedReward) return;
        setShippingMethod(selectedReward.fulfillmentType && selectedReward.fulfillmentType !== "PHYSICAL" ? "EMAIL" : "STANDARD");
    }, [selectedReward?.id, selectedReward?.fulfillmentType]);

    // Physical products need an address; digital products use email or the purchase vault.
    const isDigitalProduct = Boolean(selectedReward && selectedReward.fulfillmentType && selectedReward.fulfillmentType !== "PHYSICAL");
    const needsShippingAddress = Boolean(isRewardDonation && selectedReward && !isDigitalProduct);
    const needsProductEmail = Boolean(isRewardDonation && selectedReward);
    const userHasShippingAddress = isAuthenticated && (currentUser as any)?.shippingAddress;
    const shouldShowShippingForm = needsShippingAddress && (!userHasShippingAddress || !isAuthenticated);

    // Helper function to get RGB colors for gradients
    const getSliderColors = (accent: string) => {
        switch (accent) {
            case 'green':
                return { primary: 'rgb(22 163 74)', secondary: 'rgb(16 185 129)' };
            case 'amber':
                return { primary: 'rgb(217 119 6)', secondary: 'rgb(245 158 11)' };
            default:
                return { primary: 'rgb(22 163 74)', secondary: 'rgb(16 185 129)' };
        }
    };

    const currentMethod = PAYMENT_METHODS[paymentMethod];
    const sliderColors = getSliderColors(currentMethod.colors.accent);

    const unitAmount = isRewardDonation && selectedReward ? Number(selectedReward.minAmount) : customAmount;
    const productSubtotal = isRewardDonation && selectedReward ? unitAmount * quantity : unitAmount;
    const effectiveTipPercent = isReadyProduct ? 0 : tipPercent;
    const finalTipAmount = useMemo(
        () => Math.round((productSubtotal * effectiveTipPercent) / 100),
        [productSubtotal, effectiveTipPercent]
    );
    const shippingFee = needsShippingAddress && shippingMethod === "EXPRESS" ? 30000 : 0;
    const finalTotalAmount = productSubtotal + finalTipAmount + shippingFee;
    const finalAmount = unitAmount;

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
            if (needsProductEmail && !isAuthenticated && !guestEmail.trim()) {
                setError(isDigitalProduct ? "Vui lòng nhập email để nhận tài sản số" : "Vui lòng nhập email để nhận thông tin giao hàng");
                setLoading(false);
                return;
            }
            // Nếu khách muốn lưu phương thức nhưng chưa đăng nhập, tạo session trước rồi chuyển sang xác thực.
            if (savePaymentMethod && !isAuthenticated) {
                const sessionResponse = await fetch("/api/checkout-sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        campaignId,
                        rewardId: isRewardDonation ? effectiveSelectedRewardId : undefined,
                        amount: finalAmount,
                        quantity,
                        shippingMethod,
                        platformTipPercent: effectiveTipPercent,
                        isAnonymous,
                        displayName: isAnonymous ? undefined : displayName || undefined,
                        guestEmail: guestEmail || undefined,
                        shippingAddress: needsShippingAddress
                            ? (userHasShippingAddress ? (currentUser as any)?.shippingAddress : shippingAddress)
                            : undefined,
                        paymentMethod,
                        paymentMethodId: selectedPaymentMethodId || undefined,
                        savePaymentMethod: true,
                        returnPath: window.location.pathname,
                    }),
                });
                const sessionData = await sessionResponse.json();
                if (!sessionResponse.ok || !sessionData.loginUrl) {
                    throw new Error(sessionData.error || "Không thể lưu phiên thanh toán");
                }
                router.push(sessionData.loginUrl);
                return;
            }

            // Prepare payload based on auth status
            const payload = {
                campaignId,
                rewardId: isRewardDonation ? effectiveSelectedRewardId : undefined,
                amount: finalAmount,
                quantity,
                shippingMethod,
                platformTipPercent: tipPercent,
                isAnonymous,
                paymentMethod,
                paymentMethodId: selectedPaymentMethodId || undefined,
                savePaymentMethod: savePaymentMethod && Boolean(isAuthenticated),
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

            // Xử lý các payment gateway khác (redirect)
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else if (data.confirmationUrl) {
                router.push(data.confirmationUrl);
            } else if (data.pledgeId) {
                router.push(`/payment-success?ref=${encodeURIComponent(data.transactionId || data.pledgeId)}&status=pending`);
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
        quantity,
        shippingMethod,
        effectiveTipPercent,
        isAnonymous,
        paymentMethod,
        router,
        isAuthenticated,
        currentUser,
        displayName,
        guestEmail,
        isRewardDonation,
        needsShippingAddress,
        needsProductEmail,
        isDigitalProduct,
        userHasShippingAddress,
        shippingAddress,
        savePaymentMethod,
        selectedPaymentMethodId
    ]);

    return (
        <div className={showHeader ? "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden" : ""}>
            {showHeader && (
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-5">
                    <h2 className="text-white font-bold text-xl">💜 Ủng hộ dự án</h2>
                    <p className="text-emerald-100 text-sm mt-1">
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
                                        {selectedReward.availability === "DEVELOPMENT" && selectedReward.estimatedDelivery && (
                                            <p className="text-xs text-gray-500 mt-1">📦 Dự kiến giao: {selectedReward.estimatedDelivery}</p>
                                        )}
                                        <p className="text-xs font-semibold text-emerald-700 mt-1">
                                            {selectedReward.availability === "AVAILABLE" ? "Sản phẩm có sẵn" : "Sản phẩm đang phát triển"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="text-xs font-semibold text-gray-600 mr-2">Số lượng</span>
                                            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="w-7 h-7 rounded-lg border border-gray-200 text-gray-700 hover:border-green-500">−</button>
                                            <span className="w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
                                            <button type="button" onClick={() => setQuantity((value) => Math.min(selectedReward.maxQuantity || 99, value + 1))} className="w-7 h-7 rounded-lg border border-gray-200 text-gray-700 hover:border-green-500">+</button>
                                        </div>
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
                                            ? `${currentMethod.colors.accent === 'amber' ? 'border-amber-500 bg-amber-50' : 'border-green-500 bg-green-50'}`
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
                                            <p className={`text-xs font-semibold ${currentMethod.colors.accent === 'amber' ? 'text-amber-600' : 'text-green-600'}`}>{formatVND(r.minAmount)}+</p>
                                            {r.description && (
                                                <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                                            )}
                                            {r.availability === "DEVELOPMENT" && r.estimatedDelivery && (
                                                <p className="text-xs text-gray-400">📦 Dự kiến giao: {r.estimatedDelivery}</p>
                                            )}
                                            <p className="text-xs text-gray-400">{r.availability === "AVAILABLE" ? "Có sẵn · có thể trả khi nhận hàng" : "Đang phát triển · ủng hộ nhận quà"}</p>
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
                                className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none ${currentMethod.colors.accent === 'amber' ? 'focus:ring-amber-500' : 'focus:ring-green-500'}`}
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
                                        className={`text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 transition ${currentMethod.colors.accent === 'amber' ? 'hover:bg-amber-50 hover:border-amber-300' : 'hover:bg-green-50 hover:border-green-300'}`}
                                    >
                                        {formatVND(amt)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tip hỗ trợ nền tảng chỉ áp dụng cho luồng ủng hộ/phát triển */}
                    {!isReadyProduct && <div>
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
                                        ? `${currentMethod.colors.accent === 'amber' ? 'bg-amber-600 text-white border-amber-600' : 'bg-green-600 text-white border-green-600'}`
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
                                    className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${currentMethod.colors.accent === 'amber' ? 'accent-amber-600' : 'accent-green-600'}`}
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
                                        className={`w-16 px-2 py-1 text-center text-sm font-bold border border-gray-200 rounded-lg focus:ring-2 outline-none ${currentMethod.colors.accent === 'amber' ? 'text-amber-600 focus:ring-amber-500' : 'text-green-600 focus:ring-green-500'}`}
                                    />
                                    <span className="text-sm font-medium text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                    </div>}

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
                                className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none ${currentMethod.colors.accent === 'amber' ? 'focus:ring-amber-500' : 'focus:ring-green-500'}`}
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
                                {needsProductEmail ? (isDigitalProduct ? "Email nhận tài sản số *" : "Email nhận thông tin giao hàng *") : "Email nhận xác nhận (không bắt buộc)"}
                            </label>
                            <input
                                type="email"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                placeholder={needsProductEmail ? (isDigitalProduct ? "Email để nhận tài sản số..." : "Email để nhận thông tin giao hàng...") : "Email để nhận xác nhận..."}
                                required={needsProductEmail && !isAuthenticated}
                                className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none ${currentMethod.colors.accent === 'amber' ? 'focus:ring-amber-500' : 'focus:ring-green-500'}`}
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
                                className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 outline-none resize-none ${currentMethod.colors.accent === 'amber' ? 'focus:ring-amber-500' : 'focus:ring-green-500'}`}
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

                    {isRewardDonation && selectedReward && (
                        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Phương thức nhận hàng</label>
                                <p className="text-xs text-gray-500 mt-1">{isDigitalProduct ? "Tài sản số sẽ được gửi qua email hoặc lưu trong Kho đã mua." : "Chọn phương thức vận chuyển cho sản phẩm vật lý."}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(isDigitalProduct ? [
                                    { id: "EMAIL", label: "Gửi qua email", description: "Nhận liên kết/mã tại email xác nhận" },
                                    { id: "DOWNLOAD", label: "Kho đã mua", description: "Truy cập lại trong tài khoản" },
                                ] : [
                                    { id: "STANDARD", label: "Giao tiêu chuẩn", description: "Miễn phí vận chuyển" },
                                    { id: "EXPRESS", label: "Giao nhanh", description: "+30.000đ" },
                                ]).map((method) => (
                                    <label key={method.id} className={`rounded-xl border-2 p-3 cursor-pointer ${shippingMethod === method.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}>
                                        <input type="radio" className="sr-only" checked={shippingMethod === method.id} onChange={() => setShippingMethod(method.id as typeof shippingMethod)} />
                                        <span className="block text-sm font-semibold text-gray-800">{method.label}</span>
                                        <span className="block text-xs text-gray-500 mt-1">{method.description}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Phương thức thanh toán tập trung */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Phương thức thanh toán
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                                Chọn một phương thức bên dưới. Ví, ngân hàng và thẻ sẽ được xử lý trong trang thanh toán bảo mật.
                            </p>
                        </div>

                        {savedMethods.length > 0 && isAuthenticated && (
                            <div className="rounded-xl border border-green-200 bg-green-50/70 p-3 space-y-2">
                                <p className="text-sm font-semibold text-green-900">Phương thức đã liên kết</p>
                                {savedMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedPaymentMethodId(method.id);
                                            setPaymentMethod("ONLINE");
                                        }}
                                        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${selectedPaymentMethodId === method.id
                                            ? "border-green-600 bg-white text-green-800"
                                            : "border-green-100 bg-white/70 text-gray-700 hover:border-green-400"
                                            }`}
                                    >
                                        <span className="text-sm">{method.label}{method.last4 ? ` •••• ${method.last4}` : ""}</span>
                                        {selectedPaymentMethodId === method.id && <span className="text-xs font-semibold">Đã chọn</span>}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.values(PAYMENT_METHODS).filter((method) => method.id !== "COD" || isReadyProduct).map((method) => {
                                const isSelected = paymentMethod === method.id && !selectedPaymentMethodId;
                                return (
                                    <label
                                        key={method.id}
                                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer text-sm transition-all duration-200 ${isSelected
                                            ? `${method.colors.border} ${method.colors.bg} ${method.colors.text} font-medium shadow-sm`
                                            : "border-gray-200 hover:border-green-300 hover:bg-green-50/40"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={isSelected}
                                                onChange={() => {
                                                    setPaymentMethod(method.id as "ONLINE" | "COD");
                                                    setSelectedPaymentMethodId(null);
                                                }}
                                                className="hidden"
                                            />
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? `${method.colors.border} ${method.colors.bg}` : "border-gray-300"}`}>
                                                {isSelected && <div className={`w-2 h-2 rounded-full ${method.id === "COD" ? "bg-amber-600" : "bg-green-600"}`} />}
                                            </div>
                                            <div>
                                                <div className="font-medium">{method.label}</div>
                                                <div className={`text-xs ${isSelected ? "opacity-80" : "text-gray-500"}`}>{method.description}</div>
                                            </div>
                                        </div>
                                        {isSelected && <span className="text-green-700 font-semibold">✓</span>}
                                    </label>
                                );
                            })}
                        </div>

                        {paymentMethod === "ONLINE" && (
                            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={savePaymentMethod}
                                    onChange={(event) => setSavePaymentMethod(event.target.checked)}
                                    className="mt-1 h-4 w-4 accent-green-600"
                                />
                                <span>
                                    <span className="block text-sm font-medium text-gray-800">Lưu phương thức thanh toán an toàn</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">
                                        {isAuthenticated
                                            ? "Cổng thanh toán sẽ lưu token bảo mật; Tử Tế Fund không lưu số thẻ hoặc thông tin đăng nhập ví."
                                            : "Bạn sẽ được yêu cầu đăng nhập/đăng ký, sau đó quay lại đúng bước thanh toán này."
                                        }
                                    </span>
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Tổng kết */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>{isReadyProduct ? "Giá sản phẩm" : "Số tiền ủng hộ"}</span>
                            <span>{formatVND(finalAmount)}</span>
                        </div>
                        {!isReadyProduct && <div className="flex justify-between text-gray-600">
                            <span>Tip nền tảng ({effectiveTipPercent}%)</span>
                            <span>{formatVND(finalTipAmount)}</span>
                        </div>}
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Tổng cộng</span>
                            <span className={`${PAYMENT_METHODS[paymentMethod].colors.accent === 'amber' ? 'text-amber-700' : 'text-green-700'}`}>{formatVND(finalTotalAmount)}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || productSubtotal < 50000}
                        className={`w-full bg-gradient-to-r ${PAYMENT_METHODS[paymentMethod].colors.button} disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Đang xử lý...
                            </>
                        ) : (
                            `${isReadyProduct ? (paymentMethod === "COD" ? "Đặt hàng COD" : "Mua ngay") : "Ủng hộ"} ${formatVND(finalTotalAmount)} →`
                        )}
                    </button>

                    <p className="text-xs text-center text-gray-400">
                        🔒 Thanh toán bảo mật. Tiền giữ escrow, hoàn tiền nếu không đạt mục tiêu.
                    </p>
                </form>
            )}

        </div>
    );
});

export default PledgeFormContent;