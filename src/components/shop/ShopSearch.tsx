"use client";

import { useEffect, useRef, useState } from "react";
import { formatNaira, SUGGESTED_SEARCHES, type Product } from "@/lib/shop-data";
import { SearchIcon } from "./ShopIcons";

type Props = {
  query: string;
  onQuery: (q: string) => void;
  products: Product[];
};

type Mode = "panel" | "modal" | null;

export const matchProducts = (products: Product[], q: string) => {
  const needle = q.trim().toLowerCase();
  if (!needle) return products;
  return products.filter((p) =>
    [p.name, p.category, p.description, p.size].some((f) => f.toLowerCase().includes(needle)),
  );
};

/* Shop search.
   md+    — focusing the bar lifts it into a white panel over a dimmed page.
   mobile — tapping the bar opens a full-screen search with a back arrow.
   Empty box shows suggestion chips; typing lists matching products. */
export default function ShopSearch({ query, onQuery, products }: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const barInputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setMode(null);
    barInputRef.current?.blur();
  };
  const pick = (q: string) => {
    onQuery(q);
    close();
  };

  const open = () => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (mobile) barInputRef.current?.blur();
    setMode(mobile ? "modal" : "panel");
  };

  // Panel: close on outside click / Escape.
  useEffect(() => {
    if (!mode) return;
    const onDown = (e: MouseEvent) => {
      if (mode === "panel" && wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMode(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMode(null);
        barInputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    if (mode === "modal") {
      document.body.style.overflow = "hidden";
      document.body.dataset.menu = "open";
    }
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      delete document.body.dataset.menu;
    };
  }, [mode]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    close();
  };

  return (
    <>
      {/* Dimmed page behind the desktop panel */}
      {mode === "panel" && <div aria-hidden="true" className="fixed inset-0 z-40 bg-ink/40" />}

      <div
        ref={wrapRef}
        className={`relative order-last w-full md:order-none md:max-w-2xl md:flex-1 ${mode === "panel" ? "z-50" : ""}`}
      >
        {/* White panel that wraps the bar + suggestions (desktop) */}
        {mode === "panel" && (
          <div className="absolute -inset-x-3 -top-3 rounded-3xl bg-paper pb-4 pt-[62px] shadow-2xl shadow-ink/20">
            <div className="border-t border-ink/10 px-4 pt-3">
              <Suggestions query={query} products={products} onPick={pick} />
            </div>
          </div>
        )}

        <form
          role="search"
          onSubmit={submit}
          className={`relative flex items-center gap-2 rounded-full py-1 pl-4 pr-1 transition-colors ${
            mode === "panel" ? "border border-ink/25 bg-paper" : "border border-transparent bg-ink/[0.06]"
          }`}
        >
          <SearchIcon className="h-5 w-5 shrink-0 text-ink/60" />
          <label htmlFor="shop-search" className="sr-only">
            Search products
          </label>
          <input
            ref={barInputRef}
            id="shop-search"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onFocus={() => {
              if (!mode) open();
            }}
            onClick={() => {
              if (!mode) open();
            }}
            placeholder="Search products and categories"
            className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-ink/50"
          />
          <button
            type="submit"
            className="hidden shrink-0 cursor-pointer rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-paper shadow-sm transition-colors hover:bg-brand-deep md:inline-flex"
          >
            Search
          </button>
        </form>
      </div>

      {/* Full-screen search (mobile) */}
      {mode === "modal" && (
        <div role="dialog" aria-label="Search products" className="fixed inset-0 z-[110] flex flex-col bg-paper md:hidden">
          <form onSubmit={submit} className="flex items-center gap-2 border-b border-ink/10 px-3 py-3">
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-ink hover:bg-ink/[0.05]"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-ink/25 px-4">
              <SearchIcon className="h-5 w-5 shrink-0 text-ink/60" />
              <input
                type="search"
                autoFocus
                autoComplete="off"
                enterKeyHint="search"
                aria-label="Search products"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Search products and categories"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-ink/50"
              />
            </div>
          </form>
          <div className="flex-1 overflow-y-auto px-4 pt-3">
            <Suggestions query={query} products={products} onPick={pick} />
          </div>
        </div>
      )}
    </>
  );
}

function Suggestions({
  query,
  products,
  onPick,
}: {
  query: string;
  products: Product[];
  onPick: (q: string) => void;
}) {
  const q = query.trim();

  if (!q) {
    return (
      <>
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50">Suggested searches</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_SEARCHES.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => onPick(s)}
                className="cursor-pointer rounded-full bg-ink/[0.06] px-4 py-2 text-sm text-ink transition-colors hover:bg-tint hover:text-brand"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  }

  const matches = matchProducts(products, q).slice(0, 6);

  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50">
        {matches.length ? "Products" : `No products match “${q}”`}
      </p>
      {matches.length > 0 && (
        <ul className="-mx-2 mt-2">
          {matches.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onPick(p.name)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-tint"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                  <span className="block text-xs text-ink/55">
                    {p.category} · {p.size}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{formatNaira(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
