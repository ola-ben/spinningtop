"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/* Section links without "#" in the address bar.
   Links can stay written as "/#visit" or "#how" (they still work without JS);
   this intercepts them:
   - same page  → smooth-scroll to the section, URL unchanged
   - other page → open the plain page ("/"), then jump to the section
   Any "#..." that still arrives in the URL (old/shared links) is scrolled to
   and then removed from the address bar. */

const KEY = "st_scroll_to";

function scrollToId(id: string, smooth: boolean) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "instant", block: "start" });
  return true;
}

/** Run after Next has finished its own scroll-to-top for the new page. */
const afterPaint = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(fn, 30)));

export default function HashlessLinks() {
  const router = useRouter();
  const pathname = usePathname();

  // Intercept clicks on "#section" links.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !url.hash) return;
      const id = decodeURIComponent(url.hash.slice(1));

      // Stops the browser / next/link from navigating to the "#" URL.
      // (React onClick handlers on the link — e.g. closing a menu — still run.)
      e.preventDefault();

      if (url.pathname === window.location.pathname) {
        // Let a just-closed mobile menu unlock scrolling first.
        afterPaint(() => scrollToId(id, true));
      } else {
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ path: url.pathname, id }));
        } catch {
          /* storage blocked — we'll just land at the top */
        }
        router.push(url.pathname + url.search);
      }
    };
    // Capture phase: runs before React's handlers and next/link.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // On arriving at a page: jump to a pending section, and strip any "#".
  useEffect(() => {
    let pending: { path: string; id: string } | null = null;
    try {
      pending = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
      if (pending) sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    const hash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
    const id = pending?.path === pathname ? pending.id : hash;
    if (!id) return;

    afterPaint(() => {
      scrollToId(id, false);
      if (window.location.hash) {
        window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      }
    });
  }, [pathname]);

  return null;
}
