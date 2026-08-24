"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Package, Share2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatVND } from "@/lib/utils";
import { addItemToClientCart } from "@/lib/cart-client";

export interface ShopeeCardProduct {
  id: string;
  title: string;
  description?: string | null;
  minAmount: number | null;
  maxAmount?: number | null;
  stock?: number | null;
  productImages?: string[] | null;
  campaignTitle?: string | null;
  campaignId?: string | null;
  /** Props cho chế độ chủ sở hữu */
  isOwnerMode?: boolean;
  onShare?: (e: React.MouseEvent, url: string) => void;
  onDelete?: (id: string, title: string) => void;
  onEditUrl?: string;
}

const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.2'%3E%3Cpath d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/%3E%3Cpolyline points='3.27 6.96 12 12.01 20.73 6.96'/%3E%3Cline x1='12' y1='22.08' x2='12' y2='12'/%3E%3C/svg%3E";

/**
 * Thẻ sản phẩm phong cách Shopee:
 * - Ảnh vuông 1:1 phía trên (placeholder khi chưa có ảnh)
 * - Badge % giảm giá góc trên phải ảnh
 * - Tên 2 dòng, giá cam đậm + giá gốc gạch ở dưới
 * - Nút giỏ hàng tròn cam góc dưới phải
 */
export default function ShopeeProductCard({
  product,
  size = "normal",
}: {
  product: ShopeeCardProduct;
  size?: "normal" | "compact";
}) {
  const images = Array.isArray(product.productImages) ? product.productImages : [];
  const cover = images.length > 0 ? images[0] : PLACEHOLDER_SVG;
  const discount =
    product.maxAmount &&
    product.minAmount &&
    product.maxAmount > product.minAmount
      ? Math.round(((product.maxAmount - product.minAmount) / product.maxAmount) * 100)
      : null;

  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItemToClientCart({
      id: product.id,
      title: product.title,
      image: images[0] || "",
      price: Number(product.minAmount) || 0,
      campaignId: product.campaignId || null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    toast.success(`Đã thêm "${product.title}" vào giỏ hàng`, {
      action: {
        label: "Xem giỏ hàng",
        onClick: () => window.dispatchEvent(new CustomEvent("tutefund_cart_open")),
      },
    });
  };

  const imgH = size === "compact" ? "aspect-square" : "aspect-square";
  const nameLines = size === "compact" ? "line-clamp-2" : "line-clamp-2";

  return (
    <div className="group relative bg-white rounded-md border border-gray-200/80 overflow-hidden hover:border-pgreen/60 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
      <Link href={`/products/${product.id}`} className="flex flex-col flex-1">
        {/* Ảnh vuông + badge % giảm */}
        <div className={`relative bg-gray-100 ${imgH} overflow-hidden`}>
          <img
            src={cover}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {discount !== null && discount > 0 && (
            <span className="absolute top-2 right-2 bg-pgreen text-white text-[11px] font-black px-1.5 py-0.5 rounded-sm shadow">
              -{discount}%
            </span>
          )}
          {images.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-10 h-10 text-slate-300" />
            </div>
          )}
          {images.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              +{images.length - 1}
            </span>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="p-2.5 pb-3 flex flex-col flex-1">
          <h3 className={`font-medium text-gray-900 text-[13px] leading-snug ${nameLines} group-hover:text-pgreen transition`}>
            {product.title}
          </h3>
          <div className="mt-auto pt-2 flex items-end justify-between gap-1">
            <div className="min-w-0">
              <div className="text-pgreen text-[15px] font-black leading-tight whitespace-nowrap">
                {product.minAmount ? formatVND(product.minAmount).replace("VNĐ", "") + "đ" : "Liên hệ"}
              </div>
              {discount !== null && discount > 0 && product.maxAmount && (
                <div className="text-[11px] text-gray-400 line-through leading-tight">
                  {formatVND(product.maxAmount).replace("VNĐ", "") + "đ"}
                </div>
              )}
            </div>
          </div>
          {product.stock !== null && product.stock !== undefined && (
            <div className="text-[10px] text-gray-400 mt-1">Tồn kho: {product.stock}</div>
          )}
        </div>
      </Link>

      {/* Nút giỏ hàng góc dưới phải */}
      <button
        type="button"
        onClick={handleAddToCart}
        className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
          added
            ? "bg-dblue text-white scale-110"
            : "bg-pgreen text-white hover:bg-emerald-600 hover:scale-110 active:scale-95"
        }`}
        title="Thêm vào giỏ hàng"
      >
        <ShoppingCart size={15} />
      </button>

      {/* Nút chủ sở hữu (share/edit/delete) */}
      {product.isOwnerMode && (
        <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const url = `${typeof window !== "undefined" ? window.location.origin : ""}/products/${product.id}`;
              try {
                await navigator.clipboard.writeText(url);
                toast.success("Đã sao chép link sản phẩm");
              } catch {
                toast.error("Không sao chép được link");
              }
            }}
            className="w-7 h-7 rounded-full bg-white/95 backdrop-blur border border-gray-200 text-gray-600 hover:text-pgreen hover:border-pgreen flex items-center justify-center shadow-sm transition-colors"
            title="Sao chép link sản phẩm"
          >
            <Share2 size={12} />
          </button>
          {product.onEditUrl && (
            <Link
              href={product.onEditUrl}
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-full bg-white/95 backdrop-blur border border-gray-200 text-gray-600 hover:text-pgreen hover:border-pgreen flex items-center justify-center shadow-sm transition-colors"
              title="Sửa sản phẩm"
            >
              <Pencil size={12} />
            </Link>
          )}
          {product.onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                product.onDelete?.(product.id, product.title);
              }}
              className="w-7 h-7 rounded-full bg-white/95 backdrop-blur border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-300 flex items-center justify-center shadow-sm transition-colors"
              title="Xóa sản phẩm"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
