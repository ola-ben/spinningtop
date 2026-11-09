"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  id?: string;
  /** Stagger delay in ms. */
  delay?: number;
};

/**
 * Scroll-reveal wrapper built on IntersectionObserver.
 * Mirrors naija-storefront's `whileInView` sections:
 *   - fades up 45px over 0.8s once the element is 80px inside the viewport
 *   - reveals once only; scrolling back up or down does not replay it
 * Visibility is toggled via a data attribute, so scrolling never re-renders React.
 */
export default function Reveal({ children, as: Tag = "div", className = "", id, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.dataset.visible = "true";
      return;
    }

    // Anything already on screen at load (e.g. the hero) reveals straight away
    // instead of waiting for the observer. Effects run after the first paint,
    // so the fade-up transition still plays.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = "true";
          observer.disconnect(); // reveal once, then stop watching
        }
      },
      { rootMargin: "-80px 0px -80px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
