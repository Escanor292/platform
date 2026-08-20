"use client";

import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { formatVND } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  title: string;
  /** Giá bán (number hoặc string format VND) */
  price: number | string;
  /** URL ảnh sản phẩm (tuyệt đối hoặc tương đối) */
  image?: string;
  /** Giá gốc bị gạch (nếu có khuyến mãi) */
  originalPrice?: number | string;
}

const MARKER_START = "__TUTEFUND_PRODUCT_V1__";
const MARKER_END = "__END_PRODUCT_V1__";

export function encodeProductMarker(data: ProductCardData): string {
  return `${MARKER_START}${encodeURIComponent(JSON.stringify(data))}${MARKER_END}`;
}

/** Parse text: tách các segment text thường và thẻ sản phẩm */
export function parseProductSegments(text: string) {
  const segments: Array<
    | { type: "text"; content: string }
    | { type: "product"; data: ProductCardData }
  > = [];
  const pattern = new RegExp(
    "__TUTEFUND_PRODUCT_V1__([\\s\\S]*?)__END_PRODUCT_V1__",
    "g"
  );
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    try {
      const data = JSON.parse(decodeURIComponent(match[1])) as ProductCardData;
      segments.push({ type: "product", data });
    } catch {
      segments.push({ type: "text", content: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }
  return segments;
}

export function ProductMessageCard({ data, className = "" }: { data: ProductCardData; className?: string }) {
  const priceNum = typeof data.price === "string" ? parseFloat(data.price.replace(/\./g, "").replace(/[^0-9]/g, "")) : data.price;
  const originalNum = data.originalPrice
    ? typeof data.originalPrice === "string"
      ? parseFloat(data.originalPrice.replace(/\./g, "").replace(/[^0-9]/g, ""))
      : data.originalPrice
    : null;

  return (
    <Link
      href={`/products/${data.id}`}
      className={`flex gap-3 items-center rounded-xl border border-gray-100 bg-white/95 hover:bg-gray-50 transition overflow-hidden min-w-[240px] max-w-[300px] shadow-sm ${className}`}
    >
      <div className="shrink-0 w-16 h-16 bg-gray-100 relative overflow-hidden">
        {data.image ? (
          <Image
            src={data.image}
            alt={data.title}
            fill
            className="object-cover"
            unoptimized={data.image.startsWith("http")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package size={22} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-2 pr-3">
        <p className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug">
          {data.title}
        </p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-[13px] font-extrabold text-pgreen">
            {typeof data.price === "number" ? formatVND(data.price) : data.price}
          </span>
          {originalNum && originalNum > (priceNum || 0) && (
            <>
              <span className="text-[11px] text-gray-400 line-through">
                {formatVND(originalNum)}
              </span>
              <span className="text-[10px] font-bold text-white bg-red-500 px-1 rounded">
                -{Math.round(((originalNum - (priceNum || 0)) / originalNum) * 100)}%
              </span>
            </>
          )}
        </div>
        <span className="text-[10px] text-pgreen font-medium underline">
          Xem sản phẩm ›
        </span>
      </div>
    </Link>
  );
}
