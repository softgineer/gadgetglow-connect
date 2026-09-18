import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/lib/cart";
import { store } from "@/lib/store";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const { totalQuantity } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-xl tracking-wide">
            {store.name}
            <span className="text-primary">.</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <Search className="size-3.5" />
            Search gadgets
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-sm"
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="inline-grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {totalQuantity}
            </span>
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-line bg-surface p-2 md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-background px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-muted-foreground">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
