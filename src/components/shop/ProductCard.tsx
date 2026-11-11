"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import ImageSlot from "@/components/ImageSlot";
import { formatNaira, type Product } from "@/lib/shop-data";
import AddToCart from "./AddToCart";
import WishlistButton from "./WishlistButton";

/** Product photo. Out of stock: greyed out with a red label. */
export function ProductThumb({ product: p, sizes }: { product: Product; sizes: string }) {
  return (
    <div className="relative">
      <ImageSlot
        image={{ src: p.image?.src ?? null, alt: p.name, shot: p.name }}
        aspect="aspect-square"
        sizes={sizes}
        objectPosition={p.image?.position}
        zoomOnHover={p.inStock}
        className={p.inStock ? "" : "opacity-60 grayscale"}
      />
      {!p.inStock && (
        <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-paper shadow-sm">
          Out of stock
        </span>
      )}
      <div className="absolute right-2 top-2">
        <WishlistButton product={p} />
      </div>
    </div>
  );
}

/** Opens the product page when in stock; out-of-stock items aren't clickable. */
function ProductLink({ product, className, children }: { product: Product; className: string; children: ReactNode }) {
  if (!product.inStock) {
    return (
      <div aria-disabled="true" className={`${className} cursor-not-allowed`}>
        {children}
      </div>
    );
  }
  return (
    <Link href={`/shop/${product.id}`} className={`group ${className}`}>
      {children}
    </Link>
  );
}

/** Grid card: photo, name, size, price, add to cart. */
export default function ProductCard({ product: p }: { product: Product }) {
  return (
    <div
      className={`flex h-full flex-col bg-paper transition-shadow ${p.inStock ? "hover:shadow-lg hover:shadow-ink/10" : ""}`}
    >
      <ProductLink product={p} className="flex flex-1 flex-col">
        <ProductThumb product={p} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
        <div className="flex flex-1 flex-col px-3 pt-3 sm:px-4">
          <h2
            className={`line-clamp-2 text-[13px] font-medium leading-snug sm:text-sm ${
              p.inStock ? "text-ink group-hover:text-brand" : "text-ink/50"
            }`}
          >
            {p.name}
          </h2>
          <p className="mt-0.5 text-xs text-ink/50">{p.size}</p>
          <p
            className={`mt-auto pt-2 font-display text-base font-bold tabular-nums sm:text-lg ${
              p.inStock ? "" : "text-ink/40"
            }`}
          >
            {formatNaira(p.price)}
          </p>
        </div>
      </ProductLink>
      <div className="p-3 pt-2 sm:p-4 sm:pt-3">
        <AddToCart product={p} size="sm" />
      </div>
    </div>
  );
}

/** Small related-product tile used on product pages. */
export function ProductMini({ product: p }: { product: Product }) {
  return (
    <ProductLink product={p} className="block">
      <ProductThumb product={p} sizes="(min-width: 640px) 25vw, 50vw" />
      <p
        className={`mt-2 line-clamp-2 text-[13px] font-medium leading-snug sm:text-sm ${
          p.inStock ? "group-hover:text-brand" : "text-ink/50"
        }`}
      >
        {p.name}
      </p>
      <p className={`mt-1 font-display text-sm font-bold tabular-nums sm:text-base ${p.inStock ? "" : "text-ink/40"}`}>
        {formatNaira(p.price)}
      </p>
    </ProductLink>
  );
}
