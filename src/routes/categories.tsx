import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { categoriesQuery, productsQuery } from "@/lib/catalogue";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Gadget categories · VOLTA" },
      {
        name: "description",
        content:
          "Phones, smartwatches, audio, speakers, power banks, chargers, laptop, gaming and computer accessories.",
      },
      { property: "og:title", content: "Gadget categories · VOLTA" },
      {
        property: "og:description",
        content: "Pick a category and browse sealed gadgets priced in Naira.",
      },
    ],
  }),
  component: Categories,
});

function Categories() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: products = [] } = useQuery(productsQuery);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="display-title text-4xl">Categories</h1>
      <p className="mt-2 max-w-[52ch] text-sm text-muted-foreground">
        Everything we stock, grouped the way people actually shop.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const items = products.filter((p) => p.category_id === c.id);
          const cover = items[0];
          return (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.slug }}
              className="group overflow-hidden rounded-[20px] border border-line bg-surface transition-transform hover:-translate-y-1"
            >
              <div className="aspect-[4/3] bg-background">
                {cover && (
                  <img
                    src={cover.image_url}
                    alt={c.name}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <h2 className="font-display text-xl">{c.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                <p className="mt-2 font-mono text-xs text-primary">{items.length} products</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
