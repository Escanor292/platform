"use client";

import { ShoppingCart, MessageCircle, Check } from "lucide-react";
import { useCart } from "@/components/products/CartProvider";
import { StartChatButton } from "@/components/chat/StartChatButton";
import { useState } from "react";

interface AddToCartButtonProps {
  rewardId: string;
  title: string;
  image: string;
  price: number;
  /** Số lượng kho còn lại; null/0/undefined nghĩa là hết hàng → hiện nút chat */
  stock: number | null | undefined;
  contactUserId: string;
  ownerName: string;
  campaignId?: string | null;
  isPreorder?: boolean;
  deliveryDate?: string | null;
  /** Giá gốc bị gạch (nếu có khuyến mãi) */
  originalPrice?: number;
  className?: string;
  compact?: boolean;
}

/**
 * Nút hành động chính của sản phẩm:
 * - Còn hàng (stock > 0) → "Ủng hộ ngay" (thêm vào giỏ hàng)
 * - Hết hàng → "Nhắn tin với Nhà sáng tạo"
 */
export function AddToCartButton({
  rewardId,
  title,
  image,
  price,
  stock,
  contactUserId,
  ownerName,
  campaignId,
  isPreorder = false,
  deliveryDate,
  originalPrice,
  className = "",
  compact = false,
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const hasStock = isPreorder
    ? (stock === null || stock === undefined || stock > 0)
    : !!stock && stock > 0;

  if (!hasStock) {
    return (
      <StartChatButton
        campaignOwnerId={contactUserId || rewardId}
        campaignOwnerName={ownerName}
        campaignId={campaignId || undefined}
        rewardId={rewardId}
        rewardTitle={title}
        rewardImage={image || undefined}
        rewardPrice={`${price.toLocaleString("vi-VN")}đ`}
        rewardOriginalPrice={
          originalPrice ? `${originalPrice.toLocaleString("vi-VN")}đ` : undefined
        }
        rewardIsPreorder={isPreorder}
        rewardDeliveryDate={deliveryDate}
        className={`flex-1 ${className}`}
      />
    );
  }

  const handleAdd = () => {
    addItem({
      id: rewardId,
      title,
      image,
      price,
      campaignId: campaignId || null,
      isPreorder,
      deliveryDate: deliveryDate || null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const inCart = items.some((i) => i.id === rewardId);

  const cartLabel = added ? "Đã thêm vào giỏ" : inCart ? "Sản phẩm đã có trong giỏ hàng" : "Thêm vào giỏ hàng";

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={cartLabel}
      title={cartLabel}
      className={`${compact ? "h-12 w-12 flex-none rounded-2xl border border-pgreen/20 bg-white px-0 py-0 text-pgreen hover:bg-pgreen/5" : "flex-1 rounded-xl bg-pgreen px-6 py-3.5 text-white hover:bg-pgreen/90"} inline-flex items-center justify-center gap-2 font-bold transition-colors shadow-sm ${added ? (compact ? "bg-emerald-50" : "bg-emerald-700") : ""} ${className}`}
    >
      {added ? <Check size={17} /> : <ShoppingCart size={17} />}
      {!compact && (added ? "Đã thêm vào giỏ" : inCart ? "Thêm vào giỏ" : "Thêm vào giỏ")}
    </button>
  );
}
