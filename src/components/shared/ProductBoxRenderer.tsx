/**
 * ProductBoxRenderer
 * Client-side hydration for product boxes inside blog content.
 * Finds all [data-slot="product-box"] elements, decodes their payload,
 * and renders interactive product cards.
 */

"use client";

import { useEffect, useCallback } from "react";
import { addItemToClientCart } from "@/lib/cart-client";

interface ProductPayload {
  rewardId: string | null;
  title: string;
  price: string;
  imageUrl: string | null;
  linkUrl: string | null;
  campaignId?: string | null;
  isPreorder?: boolean;
  deliveryDate?: string | null;
}

function formatVND(value: number | string): string {
  const num = Number(value);
  if (!num) return "0";
  return Math.round(num).toLocaleString("vi-VN");
}

function escapeHtml(value: string | null | undefined): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeHref(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/") || /^https?:\/\//i.test(value)) return value;
  return null;
}

export function ProductBoxRenderer() {
  const renderBoxes = useCallback(() => {
    const slots = document.querySelectorAll<HTMLDivElement>('[data-slot="product-box"]');
    slots.forEach((slot) => {
      if (slot.hasAttribute("data-rendered")) return;

      let payload: ProductPayload | null = null;
      try {
        payload = JSON.parse(decodeURIComponent(slot.getAttribute("data-payload") || "{}"));
      } catch {
        return;
      }
      if (!payload || !payload.title) return;

      const href = safeHref(payload.linkUrl) || (payload.rewardId ? `/products/${encodeURIComponent(payload.rewardId)}` : null);
      const hasPlatformProduct = Boolean(payload.rewardId);
      const title = escapeHtml(payload.title);
      const imageUrl = escapeHtml(payload.imageUrl);
      const safeImageUrl = payload.imageUrl && safeHref(payload.imageUrl) ? imageUrl : "";
      const price = escapeHtml(formatVND(payload.price));

      const card = document.createElement("div");
      card.className = "my-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-4";
      card.innerHTML = `
        <div class="flex items-center gap-4">
          <a href="${escapeHtml(href || "#")}" ${href ? 'class="flex min-w-0 flex-1 items-center gap-4"' : 'class="flex min-w-0 flex-1 items-center gap-4 pointer-events-none"'}>
            ${safeImageUrl
              ? `<img src="${safeImageUrl}" alt="${title}" class="w-24 h-24 object-cover rounded-lg border border-gray-100 flex-shrink-0" loading="lazy" />`
              : `<div class="w-24 h-24 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 text-gray-400 text-3xl">📦</div>`
            }
            <div class="min-w-0 flex-1">
              <div class="text-base font-bold text-gray-900 leading-snug">${title}</div>
              ${payload.price ? `<div class="text-base font-extrabold mt-1" style="color: #15803d;">${price} ₫</div>` : ""}
              ${payload.isPreorder ? `<div class="text-xs font-semibold mt-1" style="color: #b45309;">Đặt trước${payload.deliveryDate ? ` · giao dự kiến ${escapeHtml(new Date(payload.deliveryDate).toLocaleDateString("vi-VN"))}` : ""}</div>` : ""}
              <span class="text-xs mt-1.5 font-semibold px-3 py-1.5 rounded-lg inline-block" style="background: #ecfdf5; color: #15803d;">
                Xem sản phẩm →
              </span>
            </div>
          </a>
          ${hasPlatformProduct ? `<button type="button" data-product-box-cart class="h-10 w-10 shrink-0 rounded-xl border border-emerald-200 bg-white text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-95" aria-label="Thêm ${title} vào giỏ hàng" title="Thêm vào giỏ hàng">🛒</button>` : ""}
        </div>
      `;

      const addButton = card.querySelector<HTMLButtonElement>("[data-product-box-cart]");
      if (addButton && payload.rewardId) {
        addButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          addItemToClientCart({
            id: payload.rewardId!,
            title: payload.title,
            image: payload.imageUrl || "",
            price: Number(payload.price) || 0,
            campaignId: payload.campaignId || null,
            isPreorder: payload.isPreorder === true,
            deliveryDate: payload.deliveryDate || null,
          });
          addButton.textContent = "✓";
          addButton.setAttribute("aria-label", `Đã thêm ${payload.title} vào giỏ hàng`);
          addButton.title = "Đã thêm vào giỏ hàng";
          window.setTimeout(() => {
            addButton.textContent = "🛒";
            addButton.setAttribute("aria-label", `Thêm ${payload.title} vào giỏ hàng`);
            addButton.title = "Thêm vào giỏ hàng";
          }, 1400);
        });
      }

      card.setAttribute("data-rendered", "true");
      slot.replaceWith(card);
    });
  }, []);

  useEffect(() => {
    renderBoxes();
  }, [renderBoxes]);

  return null;
}
