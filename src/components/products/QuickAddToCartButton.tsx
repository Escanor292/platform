"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/products/CartProvider";

interface QuickAddToCartButtonProps {
  rewardId: string;
  title: string;
  image?: string;
  price: number;
  campaignId?: string | null;
  className?: string;
}

/**
 * Nút thêm sản phẩm vào giỏ hàng dạng icon, dùng cho product card và trang chi tiết.
 * Sự kiện được chặn để không kích hoạt link/card cha.
 */
export default function QuickAddToCartButton({
  rewardId,
  title,
  image = "",
  price,
  campaignId,
  className = "",
}: QuickAddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.some((item) => item.id === rewardId);

  const handleAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addItem({
      id: rewardId,
      title,
      image,
      price,
      campaignId: campaignId || null,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pgreen focus-visible:ring-offset-2 active:scale-95 ${
        added
          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
          : "border-emerald-200 bg-white text-emerald-700 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md"
      } ${className}`}
      aria-label={added ? `Đã thêm ${title} vào giỏ hàng` : `Thêm ${title} vào giỏ hàng`}
      title={added ? "Đã thêm vào giỏ hàng" : inCart ? "Thêm thêm một sản phẩm" : "Thêm vào giỏ hàng"}
    >
      {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
    </button>
  );
}
