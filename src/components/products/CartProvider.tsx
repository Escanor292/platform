"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { ShoppingCart, X, Plus, Minus, MessageCircle } from "lucide-react";
import { formatVND } from "@/lib/utils";

export interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  qty: number;
  campaignId?: string | null;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  changeQty: (id: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("tutefund_cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem("tutefund_cart", JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
    const onChange = () => setItems(loadCart());
    window.addEventListener("tutefund_cart_change", onChange);
    return () => window.removeEventListener("tutefund_cart_change", onChange);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      const next = exists
        ? prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...item, qty: 1 }];
      saveCart(next);
      return next;
    });
    window.dispatchEvent(new CustomEvent("tutefund_cart_change"));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveCart(next);
      return next;
    });
    window.dispatchEvent(new CustomEvent("tutefund_cart_change"));
  }, []);

  const changeQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      const next = prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0);
      saveCart(next);
      return next;
    });
    window.dispatchEvent(new CustomEvent("tutefund_cart_change"));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    saveCart([]);
    window.dispatchEvent(new CustomEvent("tutefund_cart_change"));
  }, []);

  const totalCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, totalCount, totalPrice, addItem, removeItem, changeQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** Badge số lượng giỏ hàng trên header icon */
export function CartBadge() {
  const { totalCount } = useCart();
  if (totalCount === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border border-white">
      {totalCount > 99 ? "99+" : totalCount}
    </span>
  );
}

/** Dropdown giỏ hàng mở bằng sự kiện tutefund_cart_open */
export function CartDropdown() {
  const { items, totalCount, totalPrice, changeQty, removeItem, clearCart } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("tutefund_cart_open", onOpen);
    return () => window.removeEventListener("tutefund_cart_open", onOpen);
  }, []);

  // Đóng khi bấm ra ngoài
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const el = document.getElementById("tutefund-cart-dropdown");
      const btn = document.getElementById("tutefund-cart-trigger");
      if (el && !el.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        id="tutefund-cart-trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-600 hover:text-pgreen hover:bg-gray-50 rounded-xl transition"
        title="Giỏ hàng"
      >
        <ShoppingCart size={20} />
        <CartBadge />
      </button>

      {open && (
        <div
          id="tutefund-cart-dropdown"
          className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-premium border border-gray-100 z-50 max-h-[70vh] flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Giỏ hàng ({totalCount})</h3>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-gray-500 hover:text-red-600 transition"
                >
                  Xóa hết
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-2 py-1">
            {items.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">
                Giỏ hàng trống
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition">
                  <Link href={`/products/${item.id}`} className="shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-14 h-14 rounded-md object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center">
                        <ShoppingCart size={16} className="text-gray-300" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.id}`} className="block text-[13px] font-medium text-gray-900 line-clamp-2 hover:text-pgreen">
                      {item.title}
                    </Link>
                    <div className="text-pgreen text-[13px] font-bold mt-0.5">
                      {formatVND(item.price).replace("VNĐ", "") + "đ"}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, item.qty - 1)}
                        className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:border-pgreen hover:text-pgreen transition"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-[13px] font-bold text-gray-800 w-6 text-center">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, item.qty + 1)}
                        className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:border-pgreen hover:text-pgreen transition"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-gray-400 hover:text-red-600 transition"
                        title="Xóa khỏi giỏ"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tổng cộng:</span>
                <span className="text-lg font-black text-pgreen">
                  {formatVND(totalPrice).replace("VNĐ", "") + "đ"}
                </span>
              </div>
                <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="block w-full text-center bg-pgreen hover:bg-emerald-600 text-white font-bold rounded-full py-2.5 text-sm transition"
              >
                Xem giỏ hàng &amp; thanh toán
              </Link>
              <p className="text-[10px] text-gray-400 text-center">
                Chọn Mua ngay trên từng sản phẩm để chọn COD, online hoặc phương thức nhận tài sản số.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
