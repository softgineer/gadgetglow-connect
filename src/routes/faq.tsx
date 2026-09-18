import { createFileRoute } from "@tanstack/react-router";

import { store } from "@/lib/store";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ · Payment, delivery and warranty · VOLTA" },
      {
        name: "description",
        content:
          "How ordering works without an online payment gateway, delivery timelines, warranty and returns at VOLTA.",
      },
      { property: "og:title", content: "FAQ · VOLTA" },
      {
        property: "og:description",
        content: "Payment, delivery, warranty and returns — answered plainly.",
      },
    ],
  }),
  component: Faq,
});

const faqs = [
  {
    q: "How do I pay?",
    a: "You don't pay on this website — there is no card form or payment gateway. After you submit an order request we contact you on WhatsApp to confirm stock and delivery, then share bank transfer details. In Lagos you can also pay on delivery.",
  },
  {
    q: "Is my order confirmed as soon as I submit it?",
    a: "Submitting creates an order request. We confirm availability first, then hold your item once payment is arranged.",
  },
  {
    q: "How long does delivery take?",
    a: "Lagos deliveries usually arrive same day or next day. Other states dispatch within 24 hours and typically arrive in 2–4 working days.",
  },
  {
    q: "Are the gadgets original?",
    a: "Yes. Everything is sealed unless clearly stated, and each unit is tested before dispatch.",
  },
  {
    q: "Do items come with warranty?",
    a: "Most gadgets carry a 12-month warranty; accessories carry 3–6 months. The exact terms are confirmed on WhatsApp before you pay.",
  },
  {
    q: "Can I return an item?",
    a: "Report any fault within 7 days of delivery and we'll replace or repair the item. Items must be in their original packaging.",
  },
];

function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="display-title text-4xl">Frequently asked</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold">{f.q}</h2>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Still unsure? Message us on WhatsApp at {store.whatsappDisplay}.
      </p>
    </div>
  );
}
