"use client";

import Link from "next/link";
import { useState } from "react";
import { clearWishlist, useWishlist } from "@/lib/wishlist-store";
import type { Product } from "@/lib/shop-data";
import ShopChrome from "./ShopChrome";
import ProductCard from "./ProductCard";
import { HeartIcon } from "./ShopIcons";

/* /wishlist — products saved with the ♡ button (stored in this browser). */
export default function WishlistView({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const ids = useWishlist();
  // Keep saved order (newest first); skip anything no longer in the catalogue.
  const saved = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);

  return (
    <ShopChrome products={products} query={query} onQuery={setQuery} navigate>
      <main className="min-h-[70vh] bg-ink/[0.03]">
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/55">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="text-ink transition-colors hover:text-brand">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">&gt;</li>
                <li>
                  <Link href="/shop" className="text-ink transition-colors hover:text-brand">
                    Shop
                  </Link>
                </li>
                <li aria-hidden="true">&gt;</li>
                <li aria-current="page">Wishlist</li>
              </ol>
            </nav>
            {saved.length > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="cursor-pointer font-semibold text-ink/50 transition-colors hover:text-red-600"
              >
                Clear all
              </button>
            )}
          </div>

          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
            Wishlist{saved.length > 0 && <span className="ml-2 text-ink/45">({saved.length})</span>}
          </h1>

          {saved.length === 0 ? (
            <div className="mt-4 flex flex-col items-center border border-ink/10 bg-paper px-6 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-tint text-ink/60">
                <HeartIcon className="h-7 w-7" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold">Your wishlist is empty.</p>
              <p className="mt-1 text-sm text-ink/55">Tap ♡ on any product to save it here.</p>
              <Link
                href="/shop"
                className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-brand-deep"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {saved.map((p) => (
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
