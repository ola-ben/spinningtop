import { useSyncExternalStore } from "react";

/* Shop cart: product id -> quantity, kept in this browser's localStorage.
   It's an order-request list sent on WhatsApp — no payment on the site
   (Brand Book p.15: no online checkout until it is operational). */

export type Cart = Record<string, number>;

const KEY = "st_cart_v1";
const EMPTY: Cart = {};
const MAX_QTY = 99;

let cache: Cart | null = null;
const listeners = new Set<() => void>();

function load(): Cart {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Cart) : {};
  } catch {
    return {};
  }
}

function getSnapshot() {
  if (cache === null) cache = load();
  return cache;
}

const getServerSnapshot = () => EMPTY;

function subscribe(callback: () => void) {
  listeners.add(callback);
  // Keep tabs in sync.
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

function commit(next: Cart) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — cart still works for this visit */
  }
  listeners.forEach((l) => l());
}

export function setQty(id: string, qty: number) {
  const next = { ...getSnapshot() };
  if (qty <= 0) delete next[id];
  else next[id] = Math.min(qty, MAX_QTY);
  commit(next);
}

export const clearCart = () => commit({});

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
