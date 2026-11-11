"use client";

import { useCallback, useState, type ReactNode } from "react";
import ShopHeader from "./ShopHeader";
import CartDrawer, { cartLines } from "./CartDrawer";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/shop-data";
import type { SearchScope } from "./ShopSearch";

/* Shared shop frame: shop header (search · account · help · cart) + cart drawer.
   Used by /shop and every product page. */
export default function ShopChrome({
  products,
  query,
  onQuery,
  navigate = false,
  scope,
  children,
}: {
  products: Product[];
  query: string;
  onQuery: (q: string) => void;
  navigate?: boolean;
  scope?: SearchScope;
  children: ReactNode;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();
  const closeCart = useCallback(() => setCartOpen(false), []);
  const cartCount = cartLines(cart, products).reduce((n, l) => n + l.qty, 0);

  return (
    <>
      <ShopHeader
        query={query}
        onQuery={onQuery}
        products={products}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        navigate={navigate}
        scope={scope}
      />
      {children}
      <CartDrawer open={cartOpen} onClose={closeCart} cart={cart} products={products} />
    </>
  );
}
