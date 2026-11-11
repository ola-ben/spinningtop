"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import ShopChrome from "@/components/shop/ShopChrome";
import ProductCard from "@/components/shop/ProductCard";
import { matchProducts } from "@/components/shop/ShopSearch";
import type { Product } from "@/lib/shop-data";

/* /shop: compact product grid. Cards show only what's needed to buy —
   photo, name, size, price, add to cart. Details live on /shop/[id]. */
export default function ShopBrowser({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => matchProducts(products, query), [products, query]);

  return (
    <ShopChrome products={products} query={query} onQuery={setQuery}>
      {/* Picks up ?q= when arriving from a product page search */}
      <Suspense fallback={null}>
        <QueryFromUrl onQuery={setQuery} />
      </Suspense>

      <main className="min-h-[70vh] bg-ink/[0.03]">
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-3 sm:px-6">
          <h1 className="sr-only">Product shop</h1>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/55">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="text-ink transition-colors hover:text-brand">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">&gt;</li>
                <li aria-current="page">Shop</li>
              </ol>
            </nav>
            <p aria-live="polite">
              {results.length} {results.length === 1 ? "product" : "products"}
              {query.trim() && <> for &ldquo;{query.trim()}&rdquo;</>}
            </p>
          </div>

          {results.length === 0 ? (
            <div className="mt-4 border border-ink/10 bg-paper px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold">No results for &ldquo;{query.trim()}&rdquo;</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 cursor-pointer text-sm font-semibold text-brand hover:text-brand-deep"
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {results.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </ShopChrome>
  );
}

function QueryFromUrl({ onQuery }: { onQuery: (q: string) => void }) {
  const params = useSearchParams();
  const q = params.get("q");
  useEffect(() => {
    if (q) onQuery(q);
  }, [q, onQuery]);
  return null;
}
