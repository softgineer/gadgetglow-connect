import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { saveLastOrder } from "@/lib/last-order";
import { formatNaira } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Order request · VOLTA" },
      {
        name: "description",
        content:
          "Send your delivery details and we'll confirm availability, delivery and payment with you on WhatsApp. No card, no online payment.",
      },
      { property: "og:title", content: "Order request · VOLTA" },
      { property: "og:description", content: "Place an order request — payment is arranged directly." },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+()\s-]+$/, "Phone can only contain numbers"),
  whatsapp: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number")
    .max(20)
    .regex(/^[0-9+()\s-]+$/, "WhatsApp can only contain numbers"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email").max(255)]),
  address: z.string().trim().min(6, "Enter your delivery address").max(300),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().trim().min(2, "Enter your state").max(80),
  notes: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  full_name: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  state: "",
  notes: "",
};

function Checkout() {
  const { items, subtotal, totalQuantity, clear } = useCart();
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function field(name: keyof FormValues, label: string, opts?: { textarea?: boolean; optional?: boolean; type?: string }) {
    const Comp = opts?.textarea ? "textarea" : "input";
    return (
      <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        <span>
          {label} {opts?.optional && <span className="text-muted-foreground/70">(optional)</span>}
        </span>
        <Comp
          value={values[name] ?? ""}
          type={opts?.type ?? "text"}
          rows={opts?.textarea ? 3 : undefined}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setValues((v) => ({ ...v, [name]: e.target.value }))
          }
          className="rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60"
        />
        {errors[name] && <span className="text-destructive">{errors[name]}</span>}
      </label>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<keyof FormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof FormValues] = issue.message;
      }
      setErrors(next);
      toast.error("Please check the highlighted fields.");
      return;
    }
    setErrors({});
    setSubmitting(true);

    const data = parsed.data;

    try {
      const { data: orderNumber, error } = await supabase.rpc("place_order", {
        _full_name: data.full_name,
        _phone: data.phone,
        _whatsapp: data.whatsapp,
        _email: data.email ?? "",
        _address: data.address,
        _city: data.city,
        _state: data.state,
        _notes: data.notes ?? "",
        _items: items.map((i) => ({
          product_id: i.productId,
          product_name: i.name,
          colour: i.colour ?? "",
          unit_price: i.price,
          quantity: i.quantity,
        })),
      });

      if (error || !orderNumber) throw error ?? new Error("Order failed");

      saveLastOrder({
        orderNumber,
        fullName: data.full_name,
        total: subtotal,
        items: items.map((i) => ({
          name: i.name,
          colour: i.colour,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
      });
      clear();
      navigate({ to: "/order-confirmation/$orderNumber", params: { orderNumber } });

    } catch (err) {
      console.error(err);
      toast.error("We couldn't submit your order. Please try again or message us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="display-title text-4xl">Order request</h1>
      <p className="mt-2 max-w-[56ch] text-sm text-muted-foreground">
        There is no online payment here. Send your details and a member of our team contacts you to
        confirm availability, delivery and payment.
      </p>

      <form onSubmit={submit} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Your details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {field("full_name", "Full name")}
              {field("phone", "Phone number", { type: "tel" })}
              {field("whatsapp", "WhatsApp number", { type: "tel" })}
              {field("email", "Email address", { optional: true, type: "email" })}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Delivery
            </h2>
            <div className="mt-4 grid gap-4">
              {field("address", "Delivery address", { textarea: true })}
              <div className="grid gap-4 sm:grid-cols-2">
                {field("city", "City")}
                {field("state", "State")}
              </div>
              {field("notes", "Additional delivery instructions", { textarea: true, optional: true })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-xl">Order summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((i) => (
              <div
                key={`${i.productId}-${i.colour ?? "d"}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.colour ? `${i.colour} · ` : ""}
                    {formatNaira(i.price)} × {i.quantity}
                  </div>
                </div>
                <span className="font-mono">{formatNaira(i.price * i.quantity)}</span>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Your cart is empty.{" "}
                <Link to="/shop" className="text-primary underline">
                  Add something
                </Link>
                .
              </p>
            )}
          </div>
          <div className="my-4 h-px bg-line" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Items</span>
            <span className="font-mono text-foreground">{totalQuantity}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl text-primary">{formatNaira(subtotal)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="mt-5 w-full rounded-full bg-whatsapp px-4 py-3 text-sm font-bold text-whatsapp-foreground transition-colors hover:bg-whatsapp/90 disabled:bg-muted disabled:text-muted-foreground"
          >
            {submitting ? "Sending…" : "Place Order / Request Order"}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            No card details are collected. Payment is arranged with you directly.
          </p>
        </div>
      </form>
    </div>
  );
}
