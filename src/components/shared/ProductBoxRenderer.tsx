/**
 * ProductBoxRenderer
 * Client-side hydration for product boxes inside blog content.
 * Finds all [data-slot="product-box"] elements, decodes their payload,
 * and renders interactive product cards.
 */

"use client";

import { useEffect, useCallback } from "react";

interface ProductPayload {
  rewardId: string | null;
  title: string;
  price: string;
  imageUrl: string | null;
  linkUrl: string | null;
}

function formatVND(value: number | string): string {
  const num = Number(value);
  if (!num) return "0";
  return Math.round(num).toLocaleString("vi-VN");
}

export function ProductBoxRenderer() {
  const renderBoxes = useCallback(() => {
    const slots = document.querySelectorAll<HTMLDivElement>('[data-slot="product-box"]');
    slots.forEach((slot) => {
      // Skip already rendered
      if (slot.hasAttribute("data-rendered")) return;

      let payload: ProductPayload | null = null;
      try {
        payload = JSON.parse(decodeURIComponent(slot.getAttribute("data-payload") || "{}"));
      } catch {
        return;
      }
      if (!payload || !payload.title) return;

      const href = payload.linkUrl
        ? payload.linkUrl.startsWith("/") || payload.linkUrl.startsWith("http")
          ? payload.linkUrl
          : `https://${payload.linkUrl}`
        : payload.rewardId
          ? `/products/${payload.rewardId}`
          : null;

      const card = document.createElement("div");
      card.className =
        "my-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-4";
      card.innerHTML = `
        <a href="${href || "#"}" ${href ? 'class="flex items-center gap-4"' : 'class="flex items-center gap-4 pointer-events-none"'}>
          ${payload.imageUrl
            ? `<img src="${payload.imageUrl}" alt="${payload.title}" class="w-24 h-24 object-cover rounded-lg border border-gray-100 flex-shrink-0" loading="lazy" />`
            : `<div class="w-24 h-24 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 text-gray-400 text-3xl">📦</div>`
          }
          <div class="flex-1 min-w-0">
            <div class="text-base font-bold text-gray-900 leading-snug">${payload.title}</div>
            ${payload.price ? `<div class="text-base font-extrabold mt-1" style="color: #15803d;">${formatVND(payload.price)} ₫</div>` : ""}
            <div class="text-xs mt-1.5 font-semibold px-3 py-1.5 rounded-lg inline-block" style="background: #ecfdf5; color: #15803d;">
              Xem sản phẩm →
            </div>
          </div>
        </a>
      `;
      slot.replaceWith(card);
    });
  }, []);

  useEffect(() => {
    renderBoxes();
  }, [renderBoxes]);

  return null;
}
