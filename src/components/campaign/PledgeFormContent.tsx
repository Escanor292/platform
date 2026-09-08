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
    isPreorder?: boolean;
    onlineDepositPercent?: number;
    codDepositPercent?: number;
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
    donationType?: "general" | "reward";
    preselectedReward?: Reward | null;
    restoredPayload?: CheckoutRestorePayload | null;
    initialQuantity?: number;
    showHeader?: boolean;
}

const PLATFORM_TIP_OPTIONS = [0, 5, 10, 15];

const PAYMENT_METHODS = {
    ONLINE: {
        id: "ONLINE",
        label: "Thanh toán online",
        description: "Chuyển khoản vào tài khoản ngân hàng trung gian",
        colors: {
            border: "border-green-500",
            bg: "bg-green-50",
            text: "text-green-700",
            button: "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
            accent: "green",
        },
    },
    COD: {
        id: "COD",
        label: "Thanh toán khi nhận hàng",
        description: "Sản phẩm có sẵn thanh toán khi nhận; pre-order cần cọc trước",
        colors: {
            border: "border-amber-500",
            bg: "bg-amber-50",
            text: "text-amber-700",
            button: "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
            accent: "amber",
        },
    },
} as const;

const PledgeFormContent = memo(function PledgeFormContent({
    campaignId,
    rewards = [],
    donationType = "general",
    preselectedReward,
    restoredPayload,
    initialQuantity = 1,
    showHeader = true,
}: PledgeFormContentProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedRewardId, setSelectedRewardId] = useState<string | null>(preselectedReward?.id ?? null);
    const [customAmount, setCustomAmount] = useState(preselectedReward?.minAmount ? Number(preselectedReward.minAmount) : 100000);
    const [displayCustomAmount, setDisplayCustomAmount] = useState("100.000");
    const [tipPercent, setTipPercent] = useState(5);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
    const [quantity, setQuantity] = useState(Math.min(99, Math.max(1, initialQuantity)));
    const [shippingMethod, setShippingMethod] = useState<"STANDARD" | "EXPRESS" | "EMAIL" | "DOWNLOAD">(
        preselectedReward?.fulfillmentType && preselectedReward.fulfillmentType !== "PHYSICAL" ? "EMAIL" : "STANDARD"
    );

    useEffect(() => {
        if (!restoredPayload) return;
        if (typeof restoredPayload.amount === "number" && Number.isFinite(restoredPayload.amount)) {
            setCustomAmount(restoredPayload.amount);
            setDisplayCustomAmount(restoredPayload.amount.toLocaleString("de-DE"));
        }
        if (typeof restoredPayload.platformTipPercent === "number") setTipPercent(restoredPayload.platformTipPercent);
        if (typeof restoredPayload.isAnonymous === "boolean") setIsAnonymous(restoredPayload.isAnonymous);
        if (typeof restoredPayload.displayName === "string") setDisplayName(restoredPayload.displayName);
        if (typeof restoredPayload.guestEmail === "string") setGuestEmail(restoredPayload.guestEmail);
        if (typeof restoredPayload.shippingAddress === "string") setShippingAddress(restoredPayload.shippingAddress);
        if (restoredPayload.paymentMethod === "ONLINE" || restoredPayload.paymentMethod === "COD") setPaymentMethod(restoredPayload.paymentMethod);
        if (typeof restoredPayload.quantity === "number") setQuantity(Math.min(99, Math.max(1, restoredPayload.quantity)));
        if (restoredPayload.shippingMethod) setShippingMethod(restoredPayload.shippingMethod);
    }, [restoredPayload]);

    const isAuthenticated = status === "authenticated" && session?.user;
    const isLoading = status === "loading";
    const currentUser = session?.user;

    const isRewardDonation = donationType === "reward";
    const isGeneralDonation = donationType === "general";
    const effectiveSelectedRewardId = isRewardDonation ? preselectedReward?.id || null : selectedRewardId;
    const selectedReward = useMemo(() => rewards.find((item) => item.id === effectiveSelectedRewardId), [rewards, effectiveSelectedRewardId]);
    const isPreorder = Boolean(selectedReward?.isPreorder);
    const isReadyProduct = selectedReward?.availability === "AVAILABLE" && !isPreorder;
    const isDigitalProduct = Boolean(selectedReward && selectedReward.fulfillmentType && selectedReward.fulfillmentType !== "PHYSICAL");
    const allowsCod = Boolean(isRewardDonation && !isDigitalProduct && (isReadyProduct || isPreorder));

    useEffect(() => {
        if (!allowsCod && paymentMethod === "COD") setPaymentMethod("ONLINE");
    }, [allowsCod, paymentMethod]);

    useEffect(() => {
        if (!selectedReward) return;
        setShippingMethod(selectedReward.fulfillmentType && selectedReward.fulfillmentType !== "PHYSICAL" ? "EMAIL" : "STANDARD");
    }, [selectedReward?.id, selectedReward?.fulfillmentType]);

    const needsShippingAddress = Boolean(isRewardDonation && selectedReward && !isDigitalProduct);
    const needsProductEmail = Boolean(isRewardDonation && selectedReward);
    const userHasShippingAddress = isAuthenticated && (currentUser as { shippingAddress?: string } | undefined)?.shippingAddress;
    const unitAmount = isRewardDonation && selectedReward ? Number(selectedReward.minAmount) : customAmount;
    const productSubtotal = isRewardDonation && selectedReward ? unitAmount * quantity : unitAmount;
    const effectiveTipPercent = isReadyProduct || paymentMethod === "COD" ? 0 : tipPercent;
    const finalTipAmount = Math.round((productSubtotal * effectiveTipPercent) / 100);
    const shippingFee = needsShippingAddress && shippingMethod === "EXPRESS" ? 30000 : 0;
    const finalChargeAmount = isPreorder && paymentMethod === "COD"
        ? Math.round(productSubtotal * (selectedReward?.codDepositPercent ?? 50) / 100)
        : productSubtotal + finalTipAmount + shippingFee;

    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (needsShippingAddress && !userHasShippingAddress && !shippingAddress.trim()) {
                setError("Vui lòng nhập địa chỉ nhận hàng để nhận phần quà");
                setLoading(false);
                return;
            }
            if (needsProductEmail && !isAuthenticated && !guestEmail.trim()) {
                setError(isDigitalProduct ? "Vui lòng nhập email để nhận tài sản số" : "Vui lòng nhập email để nhận thông tin giao hàng");
                setLoading(false);
                return;
            }
            const res = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignId,
                    rewardId: isRewardDonation ? effectiveSelectedRewardId : undefined,
                    amount: unitAmount,
                    quantity,
                    shippingMethod,
                    platformTipPercent: tipPercent,
                    isAnonymous,
                    paymentMethod,
                    displayName: isAnonymous ? undefined : isAuthenticated ? currentUser?.name || undefined : displayName || undefined,
                    guestEmail: isAuthenticated ? currentUser?.email || undefined : guestEmail || undefined,
                    shippingAddress: needsShippingAddress
                        ? (userHasShippingAddress ? (currentUser as { shippingAddress?: string })?.shippingAddress : shippingAddress)
                        : undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
            if (data.paymentUrl) window.location.href = data.paymentUrl;
            else if (data.confirmationUrl) router.push(data.confirmationUrl);
            else if (data.pledgeId) router.push(`/payment-success?ref=${encodeURIComponent(data.transactionId || data.pledgeId)}&status=pending`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Có lỗi khi xử lý ủng hộ");
        } finally {
            setLoading(false);
        }
    }, [campaignId, currentUser, displayName, effectiveSelectedRewardId, effectiveTipPercent, guestEmail, isAnonymous, isAuthenticated, isDigitalProduct, isRewardDonation, needsProductEmail, needsShippingAddress, paymentMethod, quantity, router, shippingAddress, shippingMethod, tipPercent, unitAmount, userHasShippingAddress]);

    const currentMethod = PAYMENT_METHODS[paymentMethod];

    return (
        <div className={showHeader ? "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden" : ""}>
            {showHeader && (
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-5">
                    <h2 className="text-white font-bold text-xl">Ủng hộ dự án</h2>
                    <p className="text-emerald-100 text-sm mt-1">Hỗ trợ nhà sáng tạo biến ý tưởng thành hiện thực</p>
                </div>
            )}
            {isLoading ? (
                <div className={showHeader ? "p-6" : ""}>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                        <span className="ml-2 text-gray-600">Đang tải...</span>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className={showHeader ? "p-6 space-y-6" : "space-y-6"}>
                    {error && <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">{error}</div>}

                    {isRewardDonation && selectedReward ? (
                        <div className="p-4 border-2 border-emerald-500 bg-emerald-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-800">{selectedReward.title}</p>
                            <p className="text-sm font-semibold text-emerald-600">{formatVND(selectedReward.minAmount)}</p>
                            <div className="flex items-center gap-2 mt-3">
                                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="w-7 h-7 rounded-lg border border-gray-200">−</button>
                                <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                                <button type="button" onClick={() => setQuantity((value) => Math.min(selectedReward.maxQuantity || 99, value + 1))} className="w-7 h-7 rounded-lg border border-gray-200">+</button>
                            </div>
                        </div>
                    ) : isGeneralDonation ? (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tiền ủng hộ (VNĐ)</label>
                            <input type="text" value={displayCustomAmount} onChange={(event) => {
                                const numeric = Number(event.target.value.replace(/\D/g, ""));
                                setCustomAmount(numeric);
                                setDisplayCustomAmount(numeric ? numeric.toLocaleString("de-DE") : "");
                            }} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                        </div>
                    ) : null}

                    {!isReadyProduct && (
                        <div className="flex gap-2">
                            {PLATFORM_TIP_OPTIONS.map((pct) => (
                                <button key={pct} type="button" onClick={() => setTipPercent(pct)} className={`flex-1 text-sm py-2 rounded-lg border ${tipPercent === pct ? "bg-green-600 text-white border-green-600" : "border-gray-200"}`}>
                                    {pct === 0 ? "Không tip" : `${pct}%`}
                                </button>
                            ))}
                        </div>
                    )}

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} />
                        Ủng hộ ẩn danh
                    </label>

                    {!isAuthenticated && (
                        <input type="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="Email nhận xác nhận" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" required={Boolean(needsProductEmail)} />
                    )}

                    {needsShippingAddress && !userHasShippingAddress && (
                        <textarea value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} placeholder="Địa chỉ nhận hàng" rows={3} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Phương thức thanh toán</label>
                            <p className="text-xs text-gray-500 mt-1">
                                {allowsCod
                                    ? "Chuyển khoản vào ngân hàng trung gian, hoặc COD nếu nhận quà vật lý."
                                    : "Ủng hộ không nhận quà: chuyển khoản vào tài khoản ngân hàng trung gian. Không chuyển cho creator."}
                            </p>
                        </div>
                        {allowsCod && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.values(PAYMENT_METHODS).map((method) => {
                                    const isSelected = paymentMethod === method.id;
                                    return (
                                        <label key={method.id} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer ${isSelected ? `${method.colors.border} ${method.colors.bg} ${method.colors.text}` : "border-gray-200"}`}>
                                            <div>
                                                <div className="font-medium">{method.label}</div>
                                                <div className="text-xs text-gray-500">{method.description}</div>
                                            </div>
                                            <input type="radio" name="paymentMethod" checked={isSelected} onChange={() => {
                                                setPaymentMethod(method.id as "ONLINE" | "COD");
                                            }} />
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        {paymentMethod === "ONLINE" && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                                Sau khi xác nhận, bạn chuyển khoản vào <strong>tài khoản ngân hàng trung gian</strong>.
                                Tiền được giữ đến khi chiến dịch kết thúc — đạt mục tiêu thì chi cho creator, không đạt thì hoàn.
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 text-sm flex justify-between font-bold">
                        <span>{isPreorder && paymentMethod === "COD" ? "Số tiền cọc" : "Tổng cộng"}</span>
                        <span className={currentMethod.colors.text}>{formatVND(finalChargeAmount)}</span>
                    </div>

                    <button type="submit" disabled={loading || productSubtotal < 50000} className={`w-full bg-gradient-to-r ${currentMethod.colors.button} disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl`}>
                        {loading ? "Đang xử lý..." : `Ủng hộ ${formatVND(finalChargeAmount)} →`}
                    </button>
                </form>
            )}
        </div>
    );
});

export default PledgeFormContent;
