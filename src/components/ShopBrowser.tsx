"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import ImageSlot from "@/components/ImageSlot";
import ShopHeader from "@/components/shop/ShopHeader";
import { matchProducts } from "@/components/shop/ShopSearch";
import CartDrawer, { Stepper, cartLines } from "@/components/shop/CartDrawer";
import { CartIcon } from "@/components/shop/ShopIcons";
import { setQty, useCart } from "@/lib/cart-store";
import { formatNaira, type Product } from "@/lib/shop-data";

/* /shop: shop header (logo · search · account · help · cart), breadcrumb,
   then products. The cart is sent as an order request on WhatsApp. */
export default function ShopBrowser({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();
  const closeCart = useCallback(() => setCartOpen(false), []);

  const cartCount = cartLines(cart, products).reduce((n, l) => n + l.qty, 0);

  const results = useMemo(() => matchProducts(products, query), [products, query]);

  return (
    <>
      <ShopHeader query={query} onQuery={setQuery} products={products} cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />

      <main className="min-h-[70vh] bg-ink/[0.03]">
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-3 sm:px-6">
          <h1 className="sr-only">Product shop</h1>

          {/* Breadcrumb + result count */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/55">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="text-ink transition-colors hover:text-brand">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">&gt;</li>
                <li aria-current="page">Product shop</li>
              </ol>
            </nav>
            <p aria-live="polite">
              {results.length} {results.length === 1 ? "product" : "products"}
              {query.trim() && <> for &ldquo;{query.trim()}&rdquo;</>}
            </p>
          </div>

          {results.length === 0 ? (
            <div className="mt-4 border border-ink/10 bg-paper px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold">No products match &ldquo;{query.trim()}&rdquo;.</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 cursor-pointer text-sm font-semibold text-brand hover:text-brand-deep"
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
              {results.map((p) => {
                const qty = cart[p.id] ?? 0;
                return (
                  <li key={p.id} className="flex flex-col border border-ink/10 bg-paper">
                    <ImageSlot
                      image={{ src: p.image?.src ?? null, alt: p.name, shot: `${p.name} — product pack with readable label` }}
                      aspect="aspect-[4/3]"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      objectPosition={p.image?.position}
                    />
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <p className="eyebrow mb-3">{p.category}</p>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="font-display text-lg font-semibold tracking-tight">{p.name}</h2>
                          <p className="mt-0.5 text-xs text-ink/55">{p.size}</p>
                        </div>
                        <p className="shrink-0 font-display text-lg font-semibold tabular-nums">{formatNaira(p.price)}</p>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-ink/65">{p.description}</p>

                      <dl className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-xs leading-relaxed">
                        <div>
                          <dt className="inline font-semibold text-ink">How to use: </dt>
                          <dd className="inline text-ink/65">{p.usage}</dd>
                        </div>
                        {p.caution && (
                          <div>
                            <dt className="inline font-semibold text-ink">Caution: </dt>
                            <dd className="inline text-ink/65">{p.caution}</dd>
                          </div>
                        )}
                      </dl>

                      <div className="mt-auto pt-5">
                        <p
                          className={`mb-3 inline-flex items-center gap-1.5 text-xs font-medium ${
                            p.inStock ? "text-emerald-700" : "text-ink/45"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${p.inStock ? "bg-emerald-500" : "bg-ink/30"}`} />
                          {p.inStock ? "In stock" : "Out of stock"}
                        </p>
                        {!p.inStock ? (
                          <button
                            type="button"
                            disabled
                            className="w-full cursor-not-allowed rounded-full bg-ink/10 py-3 text-sm font-bold text-ink/45"
                          >
                            Out of stock
                          </button>
                        ) : qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => setQty(p.id, 1)}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-bold text-paper shadow-md shadow-brand/15 transition-colors hover:bg-brand-deep"
                          >
                            <CartIcon className="h-5 w-5" />
                            Add to cart
                          </button>
                        ) : (
                          <Stepper id={p.id} qty={qty} name={p.name} />
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      <CartDrawer open={cartOpen} onClose={closeCart} cart={cart} products={products} />
    </>
  );
}
