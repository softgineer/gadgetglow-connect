import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { productAvailable, stockLabel, type Product } from "@/lib/catalogue";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const stock = stockLabel(product);
  const available = productAvailable(product);

  const toneClass =
    stock.tone === "in"
      ? "bg-primary text-primary-foreground"
      : stock.tone === "low"
        ? "bg-warning text-warning-foreground"
        : "bg-muted text-muted-foreground";

  return (
    <div className="group rounded-[20px] border border-line bg-surface p-4 transition-transform hover:-translate-y-1">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/3] overflow-hidden rounded-[14px] bg-background"
      >
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover"
        />
        <span
          className={`absolute top-2 left-2 rounded-md px-2 py-1 text-[10px] font-bold ${toneClass}`}
        >
          {stock.text}
        </span>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link to="/product/$slug" params={{ slug: product.slug }}>
            <h3 className="text-sm font-semibold">{product.name}</h3>
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{product.short_description}</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{product.rating}★</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-display text-lg text-primary">{formatNaira(product.price)}</span>
        <button
          type="button"
          disabled={!available}
          onClick={() => {
            add(
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image_url,
                colour: product.colours[0] ?? null,
                stock: product.stock,
              },
              1,
            );
            toast.success(`${product.name} added to cart`);
          }}
          className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {available ? "Add to cart" : "Sold out"}
        </button>
      </div>
    </div>
  );
}
