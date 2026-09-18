/**
 * Store-wide settings. Edit these values to change contact details
 * without touching any page code.
 */
export const store = {
  name: "VOLTA",
  tagline: "Gadget retail, Lagos. Sealed stock, WhatsApp checkout.",
  /** Digits only, international format, no + or spaces. */
  whatsappNumber: "2348012345678",
  whatsappDisplay: "+234 801 234 5678",
  instagram: "https://instagram.com/volta.gadgets",
  instagramHandle: "@volta.gadgets",
  email: "hello@voltagadgets.ng",
  address: "12 Admiralty Way, Lekki Phase 1, Lagos",
  hours: "Mon – Sat, 9am – 7pm",
};

export function formatNaira(amount: number) {
  return "₦" + Math.round(amount).toLocaleString("en-NG");
}

export function whatsappLink(message: string) {
  return `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const ORDER_STATUSES = [
  { value: "new_order", label: "New Order" },
  { value: "contacted", label: "Contacted" },
  { value: "payment_pending", label: "Payment Pending" },
  { value: "payment_confirmed", label: "Payment Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function statusLabel(value: string) {
  return ORDER_STATUSES.find((s) => s.value === value)?.label ?? value;
}
