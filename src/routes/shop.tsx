import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/catalogue";
import { formatNaira } from "@/lib/store";

type ShopSearch = { category?: string | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Shop all gadgets · VOLTA" },
      {
        name: "description",
        content:
          "Browse phones, earbuds, smartwatches, speakers, power banks and accessories. Filter by category and price, sorted the way you like.",
      },
      { property: "og:title", content: "Shop all gadgets · VOLTA" },
      {
        property: "og:description",
        content: "Search and filter the full VOLTA gadget catalogue in Naira.",
      },
    ],
  }),
  component: Shop,
});

const sorts = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popularity" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

function Shop() {
  const { category } = Route.useSearch();
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);

  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<(typeof sorts)[number]["value"]>("newest");

  const priceCeiling = useMemo(
    () => Math.max(50000, ...products.map((p) => Number(p.price))),
    [products],
  );

  const visible = useMemo(() => {
    const catId = categories.find((c) => c.slug === category)?.id;
    let list = products.filter((p) => {
      if (catId && p.category_id !== catId) return false;
      if (maxPrice !== null && Number(p.price) > maxPrice) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      if (sort === "popular") return b.popularity - a.popularity;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [products, categories, category, maxPrice, search, sort]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="display-title text-4xl">Shop all gadgets</h1>
      <p className="mt-2 max-w-[52ch] text-sm text-muted-foreground">
        {products.length} products in stock across {categories.length} categories. Prices in Naira,
        payment arranged on WhatsApp after you place your order request.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gadgets…"
          className="w-full rounded-full border border-line bg-surface px-5 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
        />

        <div className="flex gap-3 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => navigate({ to: "/shop", search: {} })}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm ${
              !category
                ? "bg-primary font-bold text-primary-foreground"
                : "border border-line text-muted-foreground hover:border-primary/50"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate({ to: "/shop", search: { category: c.slug } })}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm ${
                category === c.slug
                  ? "bg-primary font-bold text-primary-foreground"
                  : "border border-line text-muted-foreground hover:border-primary/50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-surface p-4">
          <label className="flex min-w-[240px] flex-1 flex-col gap-2 text-xs text-muted-foreground">
            <span>
              Max price ·{" "}
              <span className="text-foreground">
                {maxPrice === null ? "Any" : formatNaira(maxPrice)}
              </span>
            </span>
            <input
              type="range"
              min={10000}
              max={priceCeiling}
              step={5000}
              value={maxPrice ?? priceCeiling}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-primary"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-muted-foreground">
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-full border border-line bg-background px-4 py-2 text-sm text-foreground outline-none"
            >
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          {maxPrice !== null && (
            <button
              type="button"
              onClick={() => setMaxPrice(null)}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Reset price
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {!isLoading && visible.length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">
          Nothing matched that search. Try a different word or clear the filters.
        </p>
      )}
    </div>
  );
}
