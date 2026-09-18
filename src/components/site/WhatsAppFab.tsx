import { whatsappLink } from "@/lib/store";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Hi VOLTA, I'd like to ask about a gadget.")}
      target="_blank"
      rel="noreferrer"
      className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-bold text-whatsapp-foreground shadow-lg transition-colors hover:bg-whatsapp/90"
    >
      Order on WhatsApp
    </a>
  );
}
