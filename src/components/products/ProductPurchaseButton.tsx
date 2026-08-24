"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, Mail, Package, ShoppingBag } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatVND } from "@/lib/utils";

type FulfillmentType = "PHYSICAL" | "EMAIL" | "DOWNLOAD" | "LICENSE_KEY" | "DIGITAL_COMIC";

interface ProductPurchaseButtonProps {
  rewardId: string;
  title: string;
  minAmount: number;
  stock: number | null;
  maxQuantity?: number | null;
  availability?: "AVAILABLE" | "DEVELOPMENT";
  fulfillmentType?: FulfillmentType;
  campaignId?: string | null;
}

export function ProductPurchaseButton({
  rewardId,
  title,
  minAmount,
  stock,
  maxQuantity,
  availability = "AVAILABLE",
  fulfillmentType = "PHYSICAL",
  campaignId,
}: ProductPurchaseButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(searchParams.get("buy") === "1");
  const [quantity, setQuantity] = useState(Math.min(99, Math.max(1, Number(searchParams.get("qty") || 1) || 1)));
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [shippingMethod, setShippingMethod] = useState<"STANDARD" | "EXPRESS" | "EMAIL" | "DOWNLOAD">(fulfillmentType === "PHYSICAL" ? "STANDARD" : "EMAIL");
  const [shippingAddress, setShippingAddress] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDigital = fulfillmentType !== "PHYSICAL";
  const maxAllowed = Math.min(99, maxQuantity || 99, stock ?? 99);
  const shippingFee = !isDigital && shippingMethod === "EXPRESS" ? 30000 : 0;
  const total = minAmount * quantity + shippingFee;
  const savedEmail = session?.user?.email || "";
  const savedAddress = (session?.user as { shippingAddress?: string } | undefined)?.shippingAddress || "";

  useEffect(() => {
    if (searchParams.get("buy") === "1") setOpen(true);
  }, [searchParams]);

  useEffect(() => {
    setShippingMethod(isDigital ? "EMAIL" : "STANDARD");
  }, [isDigital]);

  const deliveryOptions = useMemo(() => isDigital ? [
    { id: "EMAIL" as const, label: "Gửi qua email", description: "Nhận mã hoặc liên kết tại email xác nhận" },
    { id: "DOWNLOAD" as const, label: "Kho đã mua", description: "Đăng nhập để truy cập lại tài sản" },
  ] : [
    { id: "STANDARD" as const, label: "Giao tiêu chuẩn", description: "Miễn phí vận chuyển" },
    { id: "EXPRESS" as const, label: "Giao nhanh", description: "+30.000đ" },
  ], [isDigital]);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      if (!savedEmail && !guestEmail.trim()) throw new Error(isDigital ? "Vui lòng nhập email nhận tài sản số" : "Vui lòng nhập email nhận đơn hàng");
      if (!isDigital && !savedAddress && !shippingAddress.trim()) throw new Error("Vui lòng nhập địa chỉ nhận hàng");
      if (paymentMethod === "COD" && (availability !== "AVAILABLE" || isDigital)) throw new Error("COD chỉ áp dụng cho sản phẩm vật lý có sẵn");

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaignId || undefined,
          rewardId,
          amount: minAmount,
          quantity,
          paymentMethod,
          shippingMethod,
          shippingAddress: isDigital ? undefined : (savedAddress || shippingAddress),
          guestEmail: savedEmail || guestEmail,
          displayName: session?.user?.name || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tạo đơn hàng");
      if (data.paymentUrl) window.location.href = data.paymentUrl;
      else if (data.confirmationUrl) router.push(data.confirmationUrl);
      else router.push(`/payment-success?status=pending&ref=${encodeURIComponent(data.transactionId || data.pledgeId)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể tạo đơn hàng");
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-pgreen text-white font-bold rounded-xl hover:bg-pgreen/90 transition-colors shadow-sm">
        <ShoppingBag size={18} /> Mua ngay
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title={`Mua ${title}`} description="Chọn phương thức thanh toán và nhận hàng" maxWidth="2xl" showCloseButton closeOnBackdropClick closeOnEscape>
        <div className="p-6 space-y-5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="flex items-center justify-between rounded-xl bg-cream/60 border border-pgreen/10 p-4">
            <div><p className="font-semibold text-gray-900">{title}</p><p className="text-sm text-gray-500">{formatVND(minAmount)} / sản phẩm</p></div>
            <div className="flex items-center gap-2"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-8 w-8 rounded-lg border border-gray-200">−</button><span className="w-8 text-center font-bold">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(maxAllowed, value + 1))} className="h-8 w-8 rounded-lg border border-gray-200">+</button></div>
          </div>

          <div className="space-y-3"><p className="text-sm font-semibold text-gray-700">Phương thức nhận hàng</p><div className="grid gap-3 sm:grid-cols-2">{deliveryOptions.map((option) => <label key={option.id} className={`cursor-pointer rounded-xl border-2 p-3 ${shippingMethod === option.id ? "border-pgreen bg-pgreen/5" : "border-gray-200"}`}><input type="radio" className="sr-only" checked={shippingMethod === option.id} onChange={() => setShippingMethod(option.id)} /><span className="flex items-center gap-2 text-sm font-semibold text-gray-800">{isDigital ? <Mail size={15} /> : <Package size={15} />}{option.label}</span><span className="mt-1 block text-xs text-gray-500">{option.description}</span></label>)}</div></div>

          {isDigital ? <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">Email nhận tài sản số *</label><input type="email" value={guestEmail || savedEmail} onChange={(event) => setGuestEmail(event.target.value)} disabled={Boolean(savedEmail)} placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm" /></div> : <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">Địa chỉ nhận hàng *</label><textarea value={shippingAddress || savedAddress} onChange={(event) => setShippingAddress(event.target.value)} disabled={Boolean(savedAddress)} rows={3} placeholder="Nhập địa chỉ đầy đủ" className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />{!savedEmail && <input type="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="Email nhận xác nhận" className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />}</div>}

          <div className="grid gap-3 sm:grid-cols-2"><label className={`cursor-pointer rounded-xl border-2 p-3 ${paymentMethod === "ONLINE" ? "border-pgreen bg-pgreen/5" : "border-gray-200"}`}><input type="radio" className="sr-only" checked={paymentMethod === "ONLINE"} onChange={() => setPaymentMethod("ONLINE")} /><span className="flex items-center gap-2 text-sm font-semibold"><CreditCard size={15} /> Thanh toán online</span><span className="mt-1 block text-xs text-gray-500">Ví, ngân hàng hoặc thẻ qua hosted checkout</span></label><label className={`cursor-pointer rounded-xl border-2 p-3 ${paymentMethod === "COD" ? "border-amber-500 bg-amber-50" : "border-gray-200"}`}><input type="radio" className="sr-only" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} disabled={isDigital || availability !== "AVAILABLE"} /><span className="text-sm font-semibold">Thanh toán khi nhận hàng</span><span className="mt-1 block text-xs text-gray-500">Chỉ dùng cho sản phẩm vật lý có sẵn</span></label></div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4"><span className="text-sm text-gray-600">Tổng cộng</span><strong className="text-xl text-pgreen">{formatVND(total)}</strong></div>
          <button type="button" onClick={submit} disabled={loading || status === "loading" || stock === 0} className="w-full rounded-full bg-pgreen py-3.5 font-bold text-white hover:bg-emerald-600 disabled:opacity-50">{loading ? "Đang tạo đơn..." : paymentMethod === "COD" ? "Đặt hàng COD" : "Tiếp tục thanh toán"}</button>
        </div>
      </Modal>
    </>
  );
}
