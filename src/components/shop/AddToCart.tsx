"use client";

import { setQty, useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/shop-data";
import { Stepper } from "./CartDrawer";
import { CartIcon } from "./ShopIcons";

/** Add to cart → turns into a − qty + stepper once added. */
export default function AddToCart({ product, size = "md" }: { product: Product; size?: "sm" | "md" }) {
  const cart = useCart();
  const qty = cart[product.id] ?? 0;
  // Card buttons (sm) are compact and lighter; page buttons stay bold.
  const pad = size === "sm" ? "gap-1.5 py-2 text-xs font-semibold" : "gap-2 py-3.5 text-sm font-bold";

  if (!product.inStock) {
    return (
      <button type="button" disabled className={`w-full cursor-not-allowed rounded-full bg-ink/10 text-ink/45 ${pad}`}>
        Out of stock
      </button>
    );
  }

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => setQty(product.id, 1)}
        className={`flex w-full cursor-pointer items-center justify-center rounded-full bg-brand text-paper shadow-md shadow-brand/15 transition-colors hover:bg-brand-deep ${pad}`}
      >
        <CartIcon className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"} />
        Add to cart
      </button>
    );
  }

  return <Stepper id={product.id} qty={qty} name={product.name} small={size === "sm"} full />;
}
