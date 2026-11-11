"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import ShopChrome from "@/components/shop/ShopChrome";
import { PRODUCTS } from "@/lib/shop-data";
import { matchServices, type Service } from "@/lib/services-data";
import ServiceCard, { serviceScope } from "./ServiceCard";

/* /services — same layout and behaviour as /shop: shop header with search,
   breadcrumb + count, compact grid. "Request a quote" replaces Add to cart. */
export default function ServicesBrowser({ services }: { services: Service[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => matchServices(services, query), [services, query]);
  const scope = useMemo(() => serviceScope(services), [services]);

  return (
    <ShopChrome products={PRODUCTS} query={query} onQuery={setQuery} scope={scope}>
      <Suspense fallback={null}>
        <QueryFromUrl onQuery={setQuery} />
      </Suspense>

      <main className="min-h-[70vh] bg-ink/[0.03]">
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-3 sm:px-6">
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
              {results.length} {results.length === 1 ? "service" : "services"}
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
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
              {results.map((s) => (
                <li key={s.id}>
                  <ServiceCard service={s} />
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
  const q = useSearchParams().get("q");
  useEffect(() => {
    if (q) onQuery(q);
  }, [q, onQuery]);
  return null;
}
