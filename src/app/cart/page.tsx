"use client";

import Link from "next/link";
import { useCart } from "@/components/products/CartProvider";
import { formatVND } from "@/lib/utils";
import { ShoppingCart, Trash2, Plus, Minus, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, totalCount, totalPrice, changeQty, removeItem, clearCart } = useCart();
  const [contactName, setContactName] = useState<string | null>(null);

  // Fetch tên nhà sáng tạo của sản phẩm đầu tiên để hiển thị trong lời kêu gọi chat
  useEffect(() => {
    if (items.length === 0) return;
    (async () => {
      try {
        const res = await fetch(`/api/rewards/${items[0].id}`);
        if (res.ok) {
          const data = await res.json();
          const r = data.reward || data;
          const name =
            r.campaign?.users?.name ||
            r.project?.creator?.name ||
            r.campaign?.creator?.name ||
            null;
          setContactName(name);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [items.length > 0 && items[0]?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Giỏ hàng của tôi</h1>
        <p className="text-sm text-gray-500 mb-6">
          {items.length === 0
            ? "Giỏ hàng trống"
            : `${totalCount} sản phẩm trong giỏ hàng`}
        </p>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link
              href="/projects"
              className="inline-block bg-pgreen hover:bg-emerald-600 text-white font-bold rounded-full px-6 py-2.5 text-sm transition"
            >
              Khám phá dự án
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 hover:bg-gray-50 transition">
                  <Link href={`/products/${item.id}`} className="shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                        <ShoppingCart size={20} className="text-gray-300" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.id}`}
                      className="block text-sm font-semibold text-gray-900 hover:text-pgreen line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <div className="text-pgreen font-black text-base mt-1">
                      {formatVND(item.price).replace("VNĐ", "") + "đ"}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, item.qty - 1)}
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:border-pgreen hover:text-pgreen transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold text-gray-800 w-7 text-center">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, item.qty + 1)}
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:border-pgreen hover:text-pgreen transition"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-gray-400 hover:text-red-600 flex items-center gap-1 text-xs transition"
                      >
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-pgreen whitespace-nowrap">
                      {formatVND(item.price * item.qty).replace("VNĐ", "") + "đ"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-gray-500 hover:text-red-600 transition sm:mr-auto"
              >
                Xóa toàn bộ giỏ hàng
              </button>
              <div className="flex items-center justify-between gap-3 sm:w-auto">
                <span className="text-sm text-gray-600 whitespace-nowrap">Tổng cộng:</span>
                <span className="text-xl font-black text-pgreen whitespace-nowrap">
                  {formatVND(totalPrice).replace("VNĐ", "") + "đ"}
                </span>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 bg-pgreen hover:bg-emerald-600 text-white font-bold rounded-full px-5 py-2.5 text-sm transition shrink-0"
                >
                  <MessageCircle size={16} />
                  Liên hệ nhà sáng tạo
                </Link>
              </div>
            </div>
          </div>
        )}

        <p className="text-[11px] text-gray-400 mt-4 text-center">
          TửTế Fund chưa tích hợp thanh toán online. Sau khi thêm sản phẩm vào giỏ, bạn hãy
          nhắn tin với nhà sáng tạo qua mục Tin nhắn để thống nhất cách giao nhận.
        </p>
      </div>
    </div>
  );
}
