import { Link } from "@tanstack/react-router";

import { store, whatsappLink } from "@/lib/store";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-5 py-10 md:flex-row md:items-center">
        <div>
          <span className="font-display text-2xl tracking-wide">
            {store.name}
            <span className="text-primary">.</span>
          </span>
          <p className="mt-1 max-w-[34ch] text-xs text-muted-foreground">{store.tagline}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {store.address} · {store.hours}
          </p>
          <p className="text-xs text-muted-foreground">
            {store.whatsappDisplay} · {store.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link to="/faq" className="hover:text-foreground">
            FAQ
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <a href={store.instagram} className="hover:text-foreground">
            Instagram
          </a>
          <a href={whatsappLink("Hi VOLTA, I have a question.")} className="hover:text-foreground">
            WhatsApp
          </a>
          <Link to="/auth" className="hover:text-foreground">
            Staff login
          </Link>
        </div>
      </div>
      <div className="border-t border-line px-5 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {store.name} Nigeria · No online payment — every order is
        confirmed with you on WhatsApp.
      </div>
    </footer>
  );
}
