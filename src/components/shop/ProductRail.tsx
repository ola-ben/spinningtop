"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Product } from "@/lib/shop-data";
import { ProductMini } from "./ProductCard";

/* Horizontal product row: swipe on touch, ‹ › buttons everywhere.
   Buttons disable at each end. */
export default function ProductRail({
  title,
  products = [],
  tiles,
  seeAllHref = "/shop",
}: {
  title: string;
  products?: Product[];
  /** Custom tiles (e.g. services) instead of products. */
  tiles?: { key: string; node: ReactNode }[];
  seeAllHref?: string;
}) {
  const items = tiles ?? products.map((p) => ({ key: p.id, node: <ProductMini product={p} /> }));
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  const arrow =
    "grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-ink/15 bg-paper text-ink transition-colors hover:border-brand hover:text-brand disabled:cursor-default disabled:opacity-30 disabled:hover:border-ink/15 disabled:hover:text-ink";

  return (
    <section className="mt-2 bg-paper py-4 sm:mt-4 sm:p-8" aria-label={title}>
      <div className="flex items-center justify-between gap-4 px-4 sm:px-0">
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={() => scroll(-1)} disabled={atStart} aria-label="Previous products" className={arrow}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button type="button" onClick={() => scroll(1)} disabled={atEnd} aria-label="More products" className={arrow}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          </div>
          <Link href={seeAllHref} className="ml-1 text-sm font-semibold text-brand hover:text-brand-deep">
            See all
          </Link>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="no-scrollbar mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:-mx-8 sm:scroll-px-8 sm:gap-4 sm:px-8"
      >
        {items.map((t) => (
          <li key={t.key} className="w-[42%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]">
            {t.node}
          </li>
        ))}
      </ul>
    </section>
  );
}
