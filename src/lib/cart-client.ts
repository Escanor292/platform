export interface PersistedCartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  qty: number;
  campaignId?: string | null;
  isPreorder?: boolean;
  deliveryDate?: string | null;
}

export function addItemToClientCart(item: Omit<PersistedCartItem, "qty">): void {
  if (typeof window === "undefined") return;

  let cart: PersistedCartItem[] = [];
  try {
    const stored = JSON.parse(window.localStorage.getItem("tutefund_cart") || "[]");
    if (Array.isArray(stored)) cart = stored;
  } catch {
    cart = [];
  }

  const existing = cart.find((cartItem) => cartItem.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  window.localStorage.setItem("tutefund_cart", JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("tutefund_cart_change"));
}
