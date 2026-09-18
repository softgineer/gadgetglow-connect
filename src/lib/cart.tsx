import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  colour: string | null;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, colour: string | null, quantity: number) => void;
  remove: (productId: string, colour: string | null) => void;
  clear: () => void;
  ready: boolean;
};

const STORAGE_KEY = "volta-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartItem, productId: string, colour: string | null) {
  return a.productId === productId && (a.colour ?? null) === (colour ?? null);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore malformed cart */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const totalQuantity = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((n, i) => n + i.quantity * i.price, 0);

    return {
      items,
      totalQuantity,
      subtotal,
      ready,
      add: (item, quantity = 1) =>
        setItems((prev) => {
          const existing = prev.find((p) => sameLine(p, item.productId, item.colour));
          if (existing) {
            return prev.map((p) =>
              sameLine(p, item.productId, item.colour)
                ? { ...p, quantity: Math.min(p.quantity + quantity, Math.max(item.stock, 1)) }
                : p,
            );
          }
          return [...prev, { ...item, quantity }];
        }),
      setQuantity: (productId, colour, quantity) =>
        setItems((prev) =>
          prev
            .map((p) =>
              sameLine(p, productId, colour)
                ? { ...p, quantity: Math.max(0, Math.min(quantity, Math.max(p.stock, 1))) }
                : p,
            )
            .filter((p) => p.quantity > 0),
        ),
      remove: (productId, colour) =>
        setItems((prev) => prev.filter((p) => !sameLine(p, productId, colour))),
      clear: () => setItems([]),
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
