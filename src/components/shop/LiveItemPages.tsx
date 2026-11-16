"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import ProductView from "@/components/shop/ProductView";
import ServiceView from "@/components/services/ServiceView";
import { useLiveProducts, useLiveServices } from "@/lib/live-catalogue";
import type { Product } from "@/lib/shop-data";
import type { Service } from "@/lib/services-data";

/* Product and service detail pages, kept up to date from Supabase.

   Items that existed at build time have their own built page (id given).
   Items added later in /admin don't — Apache (.htaccess) serves the
   /shop/_live/ or /services/_live/ page for them, and the id is read from the
   address bar instead. */


/** "/shop/new-item/" → "new-item" (null while pre-rendering at build time). */
const idFromAddress = () => decodeURIComponent(window.location.pathname.split("/").filter(Boolean)[1] ?? "");
const noSubscribe = () => () => {};

function useIdFromAddress(enabled: boolean) {
  const id = useSyncExternalStore(noSubscribe, idFromAddress, () => null);
  return enabled ? id : null;
}

export function LiveProductPage({ id, products: initial }: { id?: string; products: Product[] }) {
  const urlId = useIdFromAddress(!id);
  const wanted = id ?? urlId;
  const { products, loaded } = useLiveProducts(initial);
  const product = wanted ? products.find((p) => p.id === wanted) : undefined;

  if (!product) {
    // Still finding out (new item loading from Supabase) — or it's gone.
    if (!loaded || !wanted) return <Skeleton label="Loading product" />;
    return <Gone noun="product" href="/shop" back="Back to the shop" />;
  }

  // Same category first, then the rest (scrollable row).
  const related = [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 8);

  return <ProductView product={product} products={products} related={related} />;
}

export function LiveServicePage({
  id,
  services: initialServices,
  products: initialProducts,
}: {
  id?: string;
  services: Service[];
  products: Product[];
}) {
  const urlId = useIdFromAddress(!id);
  const wanted = id ?? urlId;
  const { services, loaded } = useLiveServices(initialServices);
  const { products } = useLiveProducts(initialProducts);
  const service = wanted ? services.find((s) => s.id === wanted) : undefined;

  if (!service) {
    if (!loaded || !wanted) return <Skeleton label="Loading service" />;
    return <Gone noun="service" href="/services" back="See all services" />;
  }

  // Same category first, then the rest.
  const others = [
    ...services.filter((s) => s.id !== service.id && s.category === service.category),
    ...services.filter((s) => s.id !== service.id && s.category !== service.category),
  ];

  return <ServiceView service={service} services={services} products={products} others={others} />;
}

function Skeleton({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-ink/[0.03]" aria-busy="true" aria-label={label}>
      <div className="h-[120px] border-b border-ink/10 bg-paper md:h-[68px]" />
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-3 sm:px-6">
        <div className="h-3 w-40 bg-ink/10" />
        <div className="mt-3 grid gap-px md:grid-cols-2">
          <div className="aspect-[4/3] bg-ink/[0.07] md:aspect-square" />
          <div className="space-y-4 bg-paper p-5 sm:p-8">
            <div className="h-3 w-24 bg-ink/10" />
            <div className="h-7 w-2/3 bg-ink/10" />
            <div className="h-8 w-32 bg-ink/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Gone({ noun, href, back }: { noun: string; href: string; back: string }) {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-ink/[0.03] px-4 text-center">
      <div>
        <p className="font-display text-xl font-semibold">This {noun} isn&rsquo;t available</p>
        <p className="mt-2 text-sm text-ink/60">It may have been removed or renamed.</p>
        <Link href={href} className="mt-5 inline-block text-sm font-semibold text-brand hover:text-brand-deep">
          {back} →
        </Link>
      </div>
    </div>
  );
}
