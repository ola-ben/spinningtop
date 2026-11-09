"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type SwipeRailProps = {
  children: ReactNode;
  /** Accessible name for the carousel region. */
  label: string;
  /** Classes for the scrolling track (layout switches to a grid on larger screens here). */
  trackClassName?: string;
};

/**
 * Mobile swipe carousel with snap scrolling and prev/next buttons.
 * - At the first slide "previous" is disabled; at the last slide "next" is disabled.
 * - Controls are mobile-only; from `sm` up the track is laid out as a grid by `trackClassName`.
 */
export default function SwipeRail({ children, label, trackClassName = "" }: SwipeRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  const step = useCallback(() => {
    const el = trackRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return first.offsetWidth + gap;
  }, []);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const end = el.scrollLeft >= max - 4;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(end);
    const s = step();
    setActive(end ? count - 1 : s ? Math.round(el.scrollLeft / s) : 0);
  }, [count, step]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    const frame = requestAnimationFrame(sync);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const go = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * step(), behavior: "smooth" });
  };

  const goTo = (i: number) => {
    trackRef.current?.scrollTo({ left: i * step(), behavior: "smooth" });
  };

  const btn =
    "grid h-11 w-11 place-items-center rounded-full border transition-all duration-200 enabled:cursor-pointer disabled:cursor-not-allowed";
  const btnOn = "border-ink text-ink hover:bg-brand hover:border-brand hover:text-paper active:scale-95";
  const btnOff = "border-ink/15 text-ink/25";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={trackRef} className={trackClassName}>
        {children}
      </div>

      {/* Mobile controls */}
      <div className="mt-6 flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to slide ${i + 1} of ${count}`}
              onClick={() => goTo(i)}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                active === i ? "w-6 bg-brand" : "w-1.5 bg-ink/20"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={atStart}
            aria-label="Previous slide"
            className={`${btn} ${atStart ? btnOff : btnOn}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={atEnd}
            aria-label="Next slide"
            className={`${btn} ${atEnd ? btnOff : btnOn}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
