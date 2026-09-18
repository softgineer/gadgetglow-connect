import { createFileRoute, Link } from "@tanstack/react-router";

import { store } from "@/lib/store";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About VOLTA · Gadget retail in Lagos" },
      {
        name: "description",
        content:
          "VOLTA sells sealed, verified gadgets across Nigeria with honest Naira pricing and WhatsApp-first service.",
      },
      { property: "og:title", content: "About VOLTA · Gadget retail in Lagos" },
      {
        property: "og:description",
        content: "Who we are, how we source stock, and why we skip payment gateways.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="display-title text-4xl">About {store.name}</h1>
      <div className="mt-6 space-y-5 text-sm text-pretty text-muted-foreground">
        <p>
          {store.name} is a gadget store based in Lagos. We stock the phones, audio, wearables and
          accessories people actually ask for, we keep prices honest, and we test every unit before
          it goes out the door.
        </p>
        <p>
          Everything we list is sealed unless it is clearly marked otherwise. Colours, storage and
          stock levels on this site reflect what is physically on our shelves, and our team updates
          them daily.
        </p>
        <p>
          We deliberately do not run a payment gateway. Instead you send an order request, we confirm
          availability and delivery with you on WhatsApp, and then you pay us directly — bank
          transfer, or on delivery in Lagos. It keeps our prices lower and gives you a real person to
          talk to.
        </p>
        <p>
          Visit us at {store.address}. We're open {store.hours}.
        </p>
      </div>
      <Link
        to="/shop"
        className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
      >
        See what's in stock
      </Link>
    </div>
  );
}
