import { createFileRoute } from "@tanstack/react-router";

import { store, whatsappLink } from "@/lib/store";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact VOLTA · WhatsApp, Instagram, store address" },
      {
        name: "description",
        content:
          "Reach VOLTA on WhatsApp or Instagram, or visit the Lekki store. We reply during opening hours.",
      },
      { property: "og:title", content: "Contact VOLTA" },
      { property: "og:description", content: "WhatsApp, Instagram, email and store address." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const rows = [
    { label: "WhatsApp", value: store.whatsappDisplay, href: whatsappLink("Hi VOLTA!") },
    { label: "Instagram", value: store.instagramHandle, href: store.instagram },
    { label: "Email", value: store.email, href: `mailto:${store.email}` },
    { label: "Store", value: store.address, href: undefined },
    { label: "Hours", value: store.hours, href: undefined },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="display-title text-4xl">Contact us</h1>
      <p className="mt-2 max-w-[52ch] text-sm text-muted-foreground">
        WhatsApp is the fastest way to reach us — it's also where we confirm orders and payment.
      </p>

      <div className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 p-4 text-sm">
            <span className="font-mono text-xs tracking-[0.15em] text-muted-foreground uppercase">
              {r.label}
            </span>
            {r.href ? (
              <a href={r.href} target="_blank" rel="noreferrer" className="text-primary">
                {r.value}
              </a>
            ) : (
              <span className="text-right">{r.value}</span>
            )}
          </div>
        ))}
      </div>

      <a
        href={whatsappLink("Hi VOLTA, I have a question about an order.")}
        target="_blank"
        rel="noreferrer"
        className="mt-8 block rounded-full bg-whatsapp px-6 py-4 text-center text-base font-bold text-whatsapp-foreground hover:bg-whatsapp/90"
      >
        Message us on WhatsApp
      </a>
    </div>
  );
}
