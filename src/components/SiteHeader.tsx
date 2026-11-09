"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LINK_HUB, NAV } from "@/lib/site";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full bg-paper/95 backdrop-blur transition-[border-color] duration-200 ${
          scrolled ? "border-b border-ink/12" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Master logo — supplied artwork, on white, unaltered (Brand Book p.9) */}
          <a href="#top" className="shrink-0" aria-label="Spinning Top Drycleaners & Launderers — home">
            <Image
              src="/spinning-top-logo.jpg"
              alt="Spinning Top Drycleaners and Launderers"
              width={1168}
              height={424}
              priority
              className="h-11 w-auto sm:h-12"
            />
          </a>

          <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-wider text-ink/70 lg:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-brand">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={LINK_HUB}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-paper shadow-lg shadow-brand/10 transition-colors hover:bg-brand-deep sm:inline-flex"
            >
              Request a quote
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-ink/20 text-ink transition-colors hover:border-brand hover:text-brand lg:hidden"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu — slides in from the right like the storefront's */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col justify-between bg-brand p-6 text-paper transition-[transform,opacity] duration-300 ease-out lg:hidden ${
          open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/70">Spinning Top</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            tabIndex={open ? 0 : -1}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-paper/30 transition-colors hover:border-paper"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="my-auto flex flex-col items-center gap-6">
          {NAV.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${120 + i * 50}ms` : "0ms" }}
              className={`font-display text-3xl font-bold tracking-tight transition-all duration-300 hover:opacity-70 ${
                open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-paper/20 pt-6">
          <a
            href={LINK_HUB}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            className="block w-full rounded-full bg-paper py-4 text-center text-sm font-bold text-brand transition-opacity hover:opacity-90"
          >
            Request a quote →
          </a>
          <p className="text-center font-mono text-[10px] uppercase tracking-widest text-paper/60">
            Better care. Easier living. Brighter futures.
          </p>
        </div>
      </div>
    </>
  );
}
