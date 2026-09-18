export type PlacedOrder = {
  orderNumber: string;
  fullName: string;
  total: number;
  items: { name: string; colour: string | null; quantity: number; unitPrice: number }[];
};

const KEY = "volta-last-order-v1";

export function saveLastOrder(order: PlacedOrder) {
  try {
    localStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* ignore */
  }
}

export function readLastOrder(): PlacedOrder | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlacedOrder) : null;
  } catch {
    return null;
  }
}
