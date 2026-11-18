"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import ShopChrome from "@/components/shop/ShopChrome";
import type { Product } from "@/lib/shop-data";
import { useLiveProducts, useLiveServices } from "@/lib/live-catalogue";
import { matchServices, type Service } from "@/lib/services-data";
import ServiceCard, { serviceScope } from "./ServiceCard";
import { BookingBar } from "./BookingControls";

/* /services — same layout and behaviour as /shop: shop header with search,
   breadcrumb + count, compact grid. "Select" picks services for a booking request. */
export default function ServicesBrowser({
  services: initialServices,
  products: initialProducts,
}: {
  services: Service[];
  products: Product[];
}) {
  // Build-time lists first, then the live lists from Supabase.
  const { services } = useLiveServices(initialServices);
  const { products } = useLiveProducts(initialProducts);
  const [query, setQuery] = useState("");
  const results = useMemo(() => matchServices(services, query), [services, query]);
  const scope = useMemo(() => serviceScope(services), [services]);

  return (
    <ShopChrome products={products} query={query} onQuery={setQuery} scope={scope}>
      <Suspense fallback={null}>
        <QueryFromUrl onQuery={setQuery} />
      </Suspense>

      <main className="min-h-[70vh] bg-ink/[0.03]">
        <section className="mx-auto max-w-7xl px-4 pb-28 pt-3 sm:px-6">
          <h1 className="sr-only">Care services</h1>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/55">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="text-ink transition-colors hover:text-brand">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">&gt;</li>
                <li aria-current="page">Services</li>
              </ol>
            </nav>
            <p aria-live="polite">
              {query.trim() && <>Results for &ldquo;{query.trim()}&rdquo;</>}
            </p>
          </div>

          <p className="mt-3 flex items-center gap-2.5 rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm text-ink/70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-ink" aria-hidden="true">
              <rect x="3" y="3" width="8" height="8" rx="2" />
              <path d="m5.5 7 1.5 1.5L9 5.5" />
              <rect x="13" y="13" width="8" height="8" rx="2" />
              <path d="m15.5 17 1.5 1.5 2-3" />
              <path d="M13 7h8M3 17h8" />
            </svg>
            <span>
              <strong className="font-semibold text-ink">Need more than one service?</strong> Select as many as you like, then tap <strong className="font-semibold text-ink">Book now</strong> to send one request.
            </span>
          </p>

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
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
              {results.map((s) => (
                <li key={s.id}>
                  <ServiceCard service={s} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <BookingBar />
      </main>
    </ShopChrome>
  );
}

function QueryFromUrl({ onQuery }: { onQuery: (q: string) => void }) {
  const q = useSearchParams().get("q");
  useEffect(() => {
    if (q) onQuery(q);
  }, [q, onQuery]);
  return null;
}
