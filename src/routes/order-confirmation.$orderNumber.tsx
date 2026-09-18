import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { readLastOrder, type PlacedOrder } from "@/lib/last-order";
import { formatNaira, store, whatsappLink } from "@/lib/store";

export const Route = createFileRoute("/order-confirmation/$orderNumber")({
  head: () => ({
    meta: [
      { title: "Order request received · VOLTA" },
      {
        name: "description",
        content: "Your order request is in. Continue on WhatsApp to confirm delivery and payment.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { orderNumber } = Route.useParams();
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    const saved = readLastOrder();
    if (saved && saved.orderNumber === orderNumber) setOrder(saved);
  }, [orderNumber]);

  const lines = order?.items
    .map((i) => `• ${i.name}${i.colour ? ` (${i.colour})` : ""} × ${i.quantity} — ${formatNaira(i.unitPrice * i.quantity)}`)
    .join("\n");

  const message = [
    `Hello ${store.name}, I just placed an order request.`,
    "",
    `Name: ${order?.fullName ?? ""}`,
    `Order number: ${orderNumber}`,
    "",
    "Items:",
    lines ?? "",
    "",
    `Total: ${order ? formatNaira(order.total) : ""}`,
    "",
    "Please confirm my order and send the payment details.",
  ].join("\n");

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 text-center">
      <span className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
        Order {orderNumber}
      </span>
      <h1 className="display-title mt-4 text-4xl">Order Request Received!</h1>
      <p className="mx-auto mt-4 max-w-[52ch] text-sm text-muted-foreground">
        Your order has been received successfully. A member of our team will contact you shortly to
        confirm availability, delivery details, and payment.
      </p>

      {order && (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-5 text-left">
          <h2 className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            What you ordered
          </h2>
          <div className="mt-3 space-y-2">
            {order.items.map((i) => (
              <div key={i.name + (i.colour ?? "")} className="flex justify-between text-sm">
                <span>
                  {i.name}
                  {i.colour ? ` · ${i.colour}` : ""} × {i.quantity}
                </span>
                <span className="font-mono">{formatNaira(i.unitPrice * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="my-4 h-px bg-line" />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl text-primary">{formatNaira(order.total)}</span>
          </div>
        </div>
      )}

      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noreferrer"
        className="mt-8 block rounded-full bg-whatsapp px-6 py-4 text-base font-bold text-whatsapp-foreground transition-colors hover:bg-whatsapp/90"
      >
        Continue on WhatsApp
      </a>
      <p className="mt-3 text-xs text-muted-foreground">
        Prefer Instagram? DM us at{" "}
        <a href={store.instagram} className="text-primary underline">
          {store.instagramHandle}
        </a>
        .
      </p>

      <Link
        to="/shop"
        className="mt-8 inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Keep shopping
      </Link>
    </div>
  );
}
