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
  /** Giá gốc bị gạch (nếu có khuyến mãi) */
  originalPrice?: number;
  className?: string;
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
  originalPrice,
  className = "",
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const hasStock = !!stock && stock > 0;

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
        className={`flex-1 ${className}`}
      />
    );
  }

  const handleAdd = () => {
    addItem({ id: rewardId, title, image, price });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const inCart = items.some((i) => i.id === rewardId);

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-pgreen text-white font-bold rounded-xl hover:bg-pgreen/90 transition-colors shadow-sm ${added ? "bg-emerald-700" : ""} ${className}`}
    >
      {added ? (
        <>
          <Check size={17} />
          Đã thêm vào giỏ
        </>
      ) : inCart ? (
        <>
          <ShoppingCart size={17} />
          Thêm vào giỏ
        </>
      ) : (
        <>
          <ShoppingCart size={17} />
          Ủng hộ ngay
        </>
      )}
    </button>
  );
}
