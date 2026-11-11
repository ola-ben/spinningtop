"use client";

import { useEffect } from "react";
import ImageSlot from "@/components/ImageSlot";
import { WhatsAppIcon } from "@/components/SocialIcon";
import { whatsappLink } from "@/lib/site";
import { clearCart, setQty, type Cart } from "@/lib/cart-store";
import { formatNaira, type Product } from "@/lib/shop-data";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "./ShopIcons";

type Line = { product: Product; qty: number };

export function cartLines(cart: Cart, products: Product[]): Line[] {
  return products.filter((p) => cart[p.id] > 0).map((p) => ({ product: p, qty: cart[p.id] }));
}

function orderMessage(lines: Line[], total: number) {
  const items = lines
    .map(({ product: p, qty }) => `• ${qty} × ${p.name} (${p.size}) — ${formatNaira(p.price * qty)}`)
    .join("\n");
  return `Hello Spinning Top, I'd like to order:\n\n${items}\n\nEstimated total: ${formatNaira(total)}\n\nPlease confirm availability and how to pay/collect. Thank you.`;
}

/* Slide-in cart. "Checkout" is an order request on WhatsApp — the team
   confirms stock, final price and payment/collection there. */
export default function CartDrawer({
  open,
  onClose,
  cart,
  products,
}: {
  open: boolean;
  onClose: () => void;
  cart: Cart;
  products: Product[];
}) {
  const lines = cartLines(cart, products);
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    document.body.dataset.menu = "open";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      delete document.body.dataset.menu;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const tab = open ? 0 : -1;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/40"
      />
      <aside
        role="dialog"
        aria-label="Cart"
        className={`absolute inset-y-0 right-0 flex w-[min(26rem,100vw)] flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="font-display text-lg font-semibold">
            Cart{count > 0 && <span className="ml-1.5 text-ink/50">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={onClose}
            tabIndex={tab}
            aria-label="Close cart"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-ink/[0.05]"
          >
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-display text-lg font-semibold">Your cart is empty.</p>
            <p className="mt-2 text-sm text-ink/60">Add products, then send your order request to us on WhatsApp.</p>
            <button
              type="button"
              onClick={onClose}
              tabIndex={tab}
              className="mt-6 cursor-pointer rounded-full bg-brand px-6 py-3 text-sm font-bold text-paper hover:bg-brand-deep"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-5">
              {lines.map(({ product: p, qty }) => (
                <li key={p.id} className="flex gap-4 py-4">
                  <ImageSlot
                    image={{ src: p.image?.src ?? null, alt: p.name, shot: p.name }}
                    aspect="aspect-square"
                    sizes="80px"
                    className="!w-20 shrink-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-ink/55">{p.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQty(p.id, 0)}
                        tabIndex={tab}
                        aria-label={`Remove ${p.name}`}
                        className="cursor-pointer p-1 text-ink/40 transition-colors hover:text-red-600"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <Stepper id={p.id} qty={qty} name={p.name} tab={tab} small />
                      <p className="text-sm font-semibold tabular-nums">{formatNaira(p.price * qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink/10 px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink/65">Estimated total</span>
                <span className="font-display text-xl font-bold tabular-nums">{formatNaira(total)}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink/55">
                No payment is taken on this website. We&rsquo;ll confirm availability, final price and payment or
                collection with you on WhatsApp.
              </p>
              <a
                href={whatsappLink(orderMessage(lines, total))}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={tab}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold text-paper transition-colors hover:bg-brand-deep"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Send order on WhatsApp
              </a>
              <button
                type="button"
                onClick={clearCart}
                tabIndex={tab}
                className="mt-3 w-full cursor-pointer text-center text-xs font-semibold text-ink/50 transition-colors hover:text-red-600"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/** − qty + control, shared by the cart and product cards. */
export function Stepper({
  id,
  qty,
  name,
  tab = 0,
  small = false,
  full = !small,
}: {
  id: string;
  qty: number;
  name: string;
  tab?: number;
  small?: boolean;
  /** Stretch across the available width. */
  full?: boolean;
}) {
  const btn = `grid cursor-pointer place-items-center rounded-full bg-brand text-paper transition-colors hover:bg-brand-deep ${
    small ? "h-7 w-7" : "h-10 w-10"
  }`;
  return (
    <div className={`flex items-center ${full ? "w-full justify-between" : "gap-3"}`}>
      <button type="button" tabIndex={tab} onClick={() => setQty(id, qty - 1)} aria-label={`Remove one ${name}`} className={btn}>
        <MinusIcon className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
      <span aria-live="polite" className={`min-w-6 text-center font-semibold tabular-nums ${small ? "text-sm" : ""}`}>
        {qty}
      </span>
      <button type="button" tabIndex={tab} onClick={() => setQty(id, qty + 1)} aria-label={`Add one ${name}`} className={btn}>
        <PlusIcon className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
    </div>
  );
}
