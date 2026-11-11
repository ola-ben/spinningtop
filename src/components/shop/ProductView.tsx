"use client";

import Link from "next/link";
import { useState } from "react";
import ImageSlot from "@/components/ImageSlot";
import { WhatsAppIcon } from "@/components/SocialIcon";
import { PHONE_DISPLAY, PHONE_E164, whatsappLink } from "@/lib/site";
import { PhoneIcon } from "./ShopIcons";
import { formatNaira, type Product } from "@/lib/shop-data";
import ShopChrome from "./ShopChrome";
import AddToCart from "./AddToCart";
import ProductRail from "./ProductRail";
import WishlistButton from "./WishlistButton";

/* /shop/[id] — product details: photo, price, add to cart, then the
   description, how to use and safety information. */
export default function ProductView({
  product: p,
  products,
  related,
}: {
  product: Product;
  products: Product[];
  related: Product[];
}) {
  const [query, setQuery] = useState("");

  return (
    <ShopChrome products={products} query={query} onQuery={setQuery} navigate>
      <main className="bg-ink/[0.03] md:pb-16">
        <div className="mx-auto max-w-7xl sm:px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="px-4 py-3 text-xs text-ink/55 sm:px-0">
            <ol className="flex flex-wrap items-center gap-1.5">
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
              <li aria-current="page" className="truncate">
                {p.name}
              </li>
            </ol>
          </nav>

          {/* Product summary */}
          <section className="grid gap-px bg-ink/10 md:grid-cols-2">
            <div className="relative bg-paper">
              <ImageSlot
                image={{ src: p.image?.src ?? null, alt: p.name, shot: p.name }}
                aspect="aspect-[4/3] md:aspect-square"
                sizes="(min-width: 768px) 50vw, 100vw"
                objectPosition={p.image?.position}
                className={p.inStock ? "" : "opacity-60 grayscale"}
                priority
              />
              {!p.inStock && (
                <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-paper shadow-sm">
                  Out of stock
                </span>
              )}
            </div>

            <div className="flex flex-col bg-paper p-4 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="eyebrow">{p.category}</p>
                  <h1 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                    {p.name}
                  </h1>
                </div>
                <WishlistButton product={p} variant="plain" />
              </div>
              <p className="mt-1 text-sm text-ink/55">{p.size}</p>

              <p className="mt-6 font-display text-3xl font-bold tabular-nums">{formatNaira(p.price)}</p>
              <p
                className={`mt-2 inline-flex items-center gap-1.5 text-sm font-medium ${
                  p.inStock ? "text-emerald-700" : "text-ink/45"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${p.inStock ? "bg-emerald-500" : "bg-ink/30"}`} />
                {p.inStock ? "In stock" : "Out of stock"}
              </p>

              {/* md+: inline buttons. Mobile uses the sticky bottom bar instead. */}
              <div className="mt-8 hidden flex-col gap-3 border-t border-ink/10 pt-6 md:flex">
                <AddToCart product={p} />
                <a
                  href={whatsappLink(`Hello Spinning Top, I have a question about the ${p.name} (${p.size}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 py-3.5 text-sm font-bold text-ink transition-colors hover:border-ink/40 hover:bg-ink/[0.04]"
                >
                  <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                  Ask a question
                </a>
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="mt-2 bg-paper p-4 sm:mt-4 sm:p-8">
            <h2 className="font-display text-lg font-semibold tracking-tight">Product details</h2>
            <dl className="mt-4 divide-y divide-ink/10 border-t border-ink/10 text-sm">
              <Row label="Description">{p.description}</Row>
              <Row label="How to use">{p.usage}</Row>
              {p.caution && <Row label="Safety">{p.caution}</Row>}
              <Row label="Size">{p.size}</Row>
              <Row label="Category">{p.category}</Row>
            </dl>
          </section>

          {/* Related — scrolls left and right */}
          {related.length > 0 && <ProductRail title="You may also need" products={related} />}
        </div>

        {/* Mobile bar: call + add to cart. Sticky — pinned to the bottom of the
            screen while reading the product, then it stops at the end of the
            page content and scrolls away with it when the footer arrives. */}
        <div className="sticky bottom-0 z-30 mt-4 flex items-center gap-3 border-t border-ink/10 bg-paper px-4 py-3 shadow-[0_-4px_16px_rgba(49,49,49,0.08)] md:hidden">
          <a
            href={`tel:${PHONE_E164}`}
            aria-label={`Call Spinning Top on ${PHONE_DISPLAY}`}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-brand text-brand transition-colors active:bg-tint"
          >
            <PhoneIcon className="h-5 w-5" />
          </a>
          <div className="min-w-0 flex-1">
            <AddToCart product={p} />
          </div>
        </div>
      </main>
    </ShopChrome>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="font-semibold text-ink">{label}</dt>
      <dd className="leading-relaxed text-ink/70">{children}</dd>
    </div>
  );
}
