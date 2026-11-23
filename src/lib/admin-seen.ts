"use client";

import { useSyncExternalStore } from "react";

/* "Seen" markers for admin badges, remembered in this browser.
   A badge counts only what arrived after you last opened that list, so
   it clears as soon as you've looked — even before the status changes. */

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const cache = new Map<string, number>();

function read(key: string): number {
  if (!cache.has(key)) {
    let at = 0;
    try {
      at = Date.parse(localStorage.getItem(key) ?? "") || 0;
    } catch {
      /* storage blocked — counts as never seen */
    }
    cache.set(key, at);
  }
  return cache.get(key)!;
}

/** When this list was last opened (ms; 0 = never, -1 = not read yet on the server). */
export function useSeenAt(key: string): number {
  return useSyncExternalStore(subscribe, () => read(key), () => -1);
}

/** Remember that everything in this list has now been seen. */
export function markSeen(key: string) {
  const now = new Date();
  try {
    localStorage.setItem(key, now.toISOString());
  } catch {
    /* storage blocked — badge just won't remember */
  }
  cache.set(key, now.getTime());
  listeners.forEach((l) => l());
}

export const ORDERS_SEEN = "st_admin_orders_seen";
export const BOOKINGS_SEEN = "st_admin_bookings_seen";

/**
 * How many items are new since the list was last opened. Before the first
 * visit, only items still waiting (e.g. status "Received") count.
 */
export function countUnseen<T>(items: T[], seenAt: number, createdAt: (t: T) => string, waiting: (t: T) => boolean) {
  if (seenAt < 0) return 0;
  return items.filter((t) => (seenAt ? Date.parse(createdAt(t)) > seenAt : waiting(t))).length;
}
