import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart · VOLTA" },
      {
        name: "description",
        content: "Review your gadget selection, adjust quantities and continue to your order request.",
      },
      { property: "og:title", content: "Your cart · VOLTA" },
      { property: "og:description", content: "Review your selection before requesting your order." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, totalQuantity, setQuantity, remove } = useCart();

  return (
    <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-12 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="display-title text-4xl">Your cart</h1>
        {items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
            <p className="text-sm text-muted-foreground">Your cart is empty right now.</p>
            <Link
              to="/shop"
              className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.colour ?? "default"}`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="size-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <Link to="/product/$slug" params={{ slug: item.slug }} className="text-sm font-semibold">
                    {item.name}
                    {item.colour ? ` · ${item.colour}` : ""}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {formatNaira(item.price)} × {item.quantity} ={" "}
                    {formatNaira(item.price * item.quantity)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-full border border-line bg-background font-mono text-sm">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() => setQuantity(item.productId, item.colour, item.quantity - 1)}
                      className="px-3 py-1.5 text-muted-foreground"
                    >
                      −
                    </button>
                    <span className="min-w-5 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() => setQuantity(item.productId, item.colour, item.quantity + 1)}
                      className="px-3 py-1.5 text-muted-foreground"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => remove(item.productId, item.colour)}
                    className="rounded-full border border-line p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal ({totalQuantity} items)</span>
          <span className="font-mono text-foreground">{formatNaira(subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>Delivery · Lagos</span>
          <span className="font-mono text-primary">Free</span>
        </div>
        <div className="my-4 h-px bg-line" />
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-display text-2xl text-primary">{formatNaira(subtotal)}</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          No online payment. We confirm availability, delivery and payment on WhatsApp.
        </p>
        <Link
          to="/checkout"
          className={`mt-4 flex items-center justify-center rounded-full px-4 py-3 text-sm font-bold ${
            items.length === 0
              ? "pointer-events-none bg-muted text-muted-foreground"
              : "bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
          }`}
        >
          Proceed to order request
        </Link>
        <Link
          to="/shop"
          className="mt-2 block text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
