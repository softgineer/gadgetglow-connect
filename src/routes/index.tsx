import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import heroPhone from "@/assets/hero-phone.jpg";
import heroEarbuds from "@/assets/hero-earbuds.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { useCart } from "@/lib/cart";
import { categoriesQuery, productsQuery, productAvailable } from "@/lib/catalogue";
import { formatNaira, store, whatsappLink } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VOLTA · Tech You Want. Prices You'll Love." },
      {
        name: "description",
        content:
          "Sealed smartphones, earbuds, smartwatches, speakers and accessories in Naira. Add to cart and finish your order on WhatsApp — no online payment.",
      },
      { property: "og:title", content: "VOLTA · Tech You Want. Prices You'll Love." },
      {
        property: "og:description",
        content: "Nigeria's gadget plug. Sealed stock, honest prices, WhatsApp checkout.",
      },
    ],
  }),
  component: Home,
});

const reasons = [
  { title: "Sealed & snap-tested", body: "Every unit is verified before it leaves the store." },
  { title: "Honest Naira pricing", body: "One price, no gateway fees, no hidden charges." },
  { title: "Same-day Lagos delivery", body: "Nationwide dispatch within 24 hours." },
  { title: "Real humans on WhatsApp", body: "Talk to a person before and after you buy." },
];

const testimonials = [
  {
    quote: "Ordered a phone at 10am, rider was at my office before 4pm. Sealed, clean, no stories.",
    name: "Chidera O.",
    place: "Yaba, Lagos",
  },
  {
    quote: "I liked that I could confirm everything on WhatsApp first. Paid on delivery, no wahala.",
    name: "Aisha B.",
    place: "Wuse, Abuja",
  },
  {
    quote: "Their earbuds price beat every other plug I checked, and the warranty is real.",
    name: "Tunde A.",
    place: "Port Harcourt",
  },
];

function Home() {
  const { add } = useCart();
  const { data: products = [] } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);

  const bestSellers = products.filter((p) => p.best_seller).slice(0, 4);
  const featured = products.find((p) => p.featured) ?? products[0];
  const offers = products
    .filter((p) => p.compare_at_price && p.compare_at_price > p.price)
    .slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="glow-field absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pt-16 pb-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs tracking-[0.2em] text-primary uppercase">
              New drop · Lagos
            </span>
            <h1 className="display-title mt-5 text-5xl text-balance sm:text-6xl lg:text-7xl">
              Tech You Want.
              <br />
              Prices You'll <span className="text-primary">Love.</span>
            </h1>
            <p className="mt-5 max-w-[46ch] text-base text-pretty text-muted-foreground">
              Genuine gadgets, sealed and snap-tested. Add to cart, send your order on WhatsApp, pay
              us directly — no gateway, no card fields.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
              >
                Shop best sellers
              </Link>
              <a
                href={whatsappLink("Hi VOLTA, I'd like to order a gadget.")}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-primary/50"
              >
                Order on WhatsApp
              </a>
            </div>
            <div className="mt-8 flex gap-8 text-sm">
              <div>
                <div className="font-display text-2xl">4,200+</div>
                <div className="text-muted-foreground">orders delivered</div>
              </div>
              <div>
                <div className="font-display text-2xl">₦0</div>
                <div className="text-muted-foreground">payment gateway fees</div>
              </div>
            </div>
          </div>

          <div className="rise-in relative h-[340px] lg:h-[420px]">
            <div className="drift-slow absolute top-0 right-0 size-[78%] overflow-hidden rounded-[28px] border border-line bg-surface">
              <img src={heroPhone} alt="Flagship smartphone" width={816} height={816} className="size-full object-cover" />
            </div>
            <div className="sheen absolute bottom-6 left-0 w-[52%] rotate-[-6deg] overflow-hidden rounded-[22px] border border-line bg-surface">
              <img
                src={heroEarbuds}
                alt="Wireless earbuds"
                loading="lazy"
                width={816}
                height={816}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="absolute top-4 left-2 rounded-xl border border-line bg-background/70 px-3 py-2 font-mono text-xs text-primary">
              Sealed ✓
            </div>
          </div>
        </div>
      </header>

      {/* CATEGORY CHIPS */}
      <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-5 pb-14">
        <Link
          to="/shop"
          className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/shop"
            search={{ category: c.slug }}
            className="shrink-0 rounded-full border border-line px-5 py-2.5 text-sm text-muted-foreground hover:border-primary/50"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* BEST SELLERS + FEATURED DETAIL */}
      <main className="mx-auto grid max-w-6xl items-start gap-8 px-5 pb-24 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="display-title text-3xl">Best sellers</h2>
            <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
              sorted · popular
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {featured && (
          <aside className="lg:col-start-2 lg:row-start-1">
            <div className="rounded-[22px] border border-line bg-surface p-4">
              <div className="sheen relative aspect-square overflow-hidden rounded-[14px] bg-background">
                <img
                  src={featured.image_url}
                  alt={featured.name}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div className="mt-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                  Featured gadget
                </span>
                <h3 className="display-title mt-1 text-2xl">{featured.name}</h3>
                <p className="mt-1 text-sm text-pretty text-muted-foreground">
                  {featured.short_description}
                </p>
                {featured.colours.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs text-muted-foreground">
                      Colour · <span className="text-foreground">{featured.colours[0]}</span>
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  disabled={!productAvailable(featured)}
                  onClick={() => {
                    add({
                      productId: featured.id,
                      slug: featured.slug,
                      name: featured.name,
                      price: featured.price,
                      image: featured.image_url,
                      colour: featured.colours[0] ?? null,
                      stock: featured.stock,
                    });
                    toast.success(`${featured.name} added to cart`);
                  }}
                  className="mt-4 w-full rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep disabled:bg-muted disabled:text-muted-foreground"
                >
                  Add to cart · {formatNaira(featured.price)}
                </button>
                <Link
                  to="/product/$slug"
                  params={{ slug: featured.slug }}
                  className="mt-2 block text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  View full details
                </Link>
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* SPECIAL OFFERS */}
      {offers.length > 0 && (
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <h2 className="display-title text-3xl">Special offers</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {offers.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="rounded-2xl border border-line bg-background p-4 transition-transform hover:-translate-y-1"
                >
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-xl text-primary">
                      {formatNaira(p.price)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatNaira(p.compare_at_price!)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{p.short_description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY SHOP WITH US */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="display-title text-3xl">Why shop with us</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div key={r.title} className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="text-sm font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="display-title text-3xl">What customers say</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-line bg-background p-5">
                <blockquote className="text-sm text-pretty">"{t.quote}"</blockquote>
                <figcaption className="mt-3 font-mono text-xs text-muted-foreground">
                  {t.name} · {t.place}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="glow-field absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center">
          <h2 className="display-title text-4xl">Ready when you are</h2>
          <p className="mx-auto mt-3 max-w-[48ch] text-sm text-muted-foreground">
            Build your cart, send the order request, and {store.name} confirms availability,
            delivery and payment with you on WhatsApp.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
            >
              Browse the shop
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
