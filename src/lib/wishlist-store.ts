import { useSyncExternalStore } from "react";

/* Wishlist: saved product ids, kept in this browser's localStorage
   (same approach as the cart — no account needed). */

const KEY = "st_wishlist_v1";
const EMPTY: string[] = [];

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function load(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function getSnapshot() {
  if (cache === null) cache = load();
  return cache;
}

const getServerSnapshot = () => EMPTY;

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — wishlist still works for this visit */
  }
  listeners.forEach((l) => l());
}

export function toggleWishlist(id: string) {
  const current = getSnapshot();
  // Newest first.
  commit(current.includes(id) ? current.filter((x) => x !== id) : [id, ...current]);
}

export const clearWishlist = () => commit([]);

export function useWishlist() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
