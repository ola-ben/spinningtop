import { useSyncExternalStore } from "react";

/* Recently viewed products (newest first), kept in this browser's
   localStorage. Product pages call trackViewed(id). */

const KEY = "st_recent_v1";
const MAX = 12;
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

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function trackViewed(id: string) {
  const current = getSnapshot();
  if (current[0] === id) return;
  cache = [id, ...current.filter((x) => x !== id)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage blocked */
  }
  listeners.forEach((l) => l());
}

export function clearViewed() {
  cache = [];
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage blocked */
  }
  listeners.forEach((l) => l());
}

export function useRecentlyViewed() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
