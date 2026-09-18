import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/site/ProductCard";
import { useCart } from "@/lib/cart";
import { categoriesQuery, productAvailable, productsQuery, stockLabel } from "@/lib/catalogue";
import { formatNaira, whatsappLink } from "@/lib/store";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product details · VOLTA" },
      {
        name: "description",
        content:
          "Full specs, colours, stock status and Naira pricing. Add to cart and confirm on WhatsApp.",
      },
      { property: "og:title", content: "Product details · VOLTA" },
      {
        property: "og:description",
        content: "Full specs, colours and stock status for this gadget.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { add } = useCart();
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);

  const product = products.find((p) => p.slug === slug);
  const [colour, setColour] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-5 py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="display-title text-3xl">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-sm text-primary underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const stock = stockLabel(product);
  const available = productAvailable(product);
  const selectedColour = colour ?? product.colours[0] ?? null;
  const category = categories.find((c) => c.id === product.category_id);
  const related = products.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <nav className="font-mono text-xs text-muted-foreground">
        <Link to="/shop" className="hover:text-foreground">
          Shop
        </Link>
        {category && (
          <>
            {" / "}
            <Link to="/shop" search={{ category: category.slug }} className="hover:text-foreground">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="sheen relative overflow-hidden rounded-[22px] border border-line bg-surface">
          <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" />
        </div>

        <div>
          <span
            className={`inline-block rounded-md px-2 py-1 text-[10px] font-bold ${
              stock.tone === "in"
                ? "bg-primary text-primary-foreground"
                : stock.tone === "low"
                  ? "bg-warning text-warning-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {stock.text}
          </span>
          <h1 className="display-title mt-3 text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{product.short_description}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl text-primary">{formatNaira(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatNaira(product.compare_at_price)}
              </span>
            )}
          </div>

          {product.colours.length > 0 && (
            <div className="mt-6">
              <span className="text-xs text-muted-foreground">
                Colour · <span className="text-foreground">{selectedColour}</span>
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colours.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColour(c)}
                    className={`rounded-full px-4 py-2 text-xs ${
                      selectedColour === c
                        ? "bg-primary font-bold text-primary-foreground"
                        : "border border-line text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-line bg-surface">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-muted-foreground"
              >
                −
              </button>
              <span className="min-w-6 text-center font-mono text-sm">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(Math.max(product.stock, 1), q + 1))}
                className="px-4 py-2 text-muted-foreground"
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={!available}
              onClick={() => {
                add(
                  {
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image_url,
                    colour: selectedColour,
                    stock: product.stock,
                  },
                  quantity,
                );
                toast.success(`${product.name} added to cart`);
              }}
              className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep disabled:bg-muted disabled:text-muted-foreground"
            >
              {available ? "Add to Cart" : "Out of stock"}
            </button>
          </div>

          <a
            href={whatsappLink(`Hi VOLTA, is the ${product.name} available?`)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block rounded-full border border-line px-5 py-3 text-center text-sm font-medium hover:border-primary/50"
          >
            Ask about this item on WhatsApp
          </a>

          <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Full details
            </h2>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">{product.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              No online payment — we confirm availability, delivery and payment with you directly.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="display-title text-2xl">You might also like</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
