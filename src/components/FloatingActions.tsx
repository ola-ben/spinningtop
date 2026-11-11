"use client";

import { useEffect, useState } from "react";
import { QUOTE_LINK, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/SocialIcon";

/**
 * (1) WhatsApp button — landing page only.
 * (2) Back-to-top button (landing page only) — appears after scrolling down a screen or so.
 * (3) Mobile "Request a quote" bar — pinned to the bottom once the hero
 *     (and its own quote button) has scrolled out of view.
 * Both hide while the mobile menu is open (body[data-menu="open"], see globals.css).
 */
export default function FloatingActions({
  quoteBar = true,
  raised = false,
  landing = false,
}: {
  quoteBar?: boolean;
  /** Mobile: sit above a page's own sticky bottom bar (e.g. product page add-to-cart). */
  raised?: boolean;
  /** Landing page only: floating WhatsApp + back-to-top buttons. */
  landing?: boolean;
}) {
  const [showTop, setShowTop] = useState(false);
  const [heroGone, setShowBar] = useState(false);
  // Shop pages turn the quote bar off — they have their own cart actions.
  const showBar = quoteBar && heroGone;
  const lifted = showBar || raised;

  useEffect(() => {
    if (!landing) return;
    const onScroll = () => setShowTop(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [landing]);

  useEffect(() => {
    if (!quoteBar) return;
    // The hero is the first section inside <main>.
    const hero = document.querySelector("main > section");
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [quoteBar]);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="floating-actions">
      {/* Floating WhatsApp chat — bottom-right corner, lifts above the mobile quote bar */}
      {landing && (
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Spinning Top on WhatsApp"
          title="Chat on WhatsApp"
          className={`fixed right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-all duration-300 hover:scale-105 hover:bg-[#1ebe5b] sm:bottom-6 sm:right-6 ${
            lifted ? "bottom-24" : "bottom-6"
          }`}
        >
          <WhatsAppIcon className="h-7 w-7" />
        </a>
      )}

      {/* Back to top — stacked just above the WhatsApp button (landing page only) */}
      {landing && (
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        className={`fixed right-[22px] z-40 grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-ink/15 bg-paper/95 text-ink shadow-md backdrop-blur transition-all duration-300 hover:border-brand hover:bg-brand hover:text-paper sm:bottom-[92px] sm:right-[30px] ${lifted ? "bottom-[164px]" : "bottom-[92px]"} ${showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
        </svg>
      </button>
      )}

      {/* Mobile quote bar (not rendered on shop pages) */}
      {quoteBar && (
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 ease-out sm:hidden ${
          showBar ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <a
          href={QUOTE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={showBar ? 0 : -1}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold text-paper shadow-lg shadow-brand/20 transition-colors active:bg-brand-deep"
        >
          Request a quote
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
      )}
    </div>
  );
}
