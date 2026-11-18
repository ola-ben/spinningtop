import { useSyncExternalStore } from "react";

/* Services picked for a booking request: a list of service ids kept in this
   browser's localStorage. Separate from the product cart. */

const KEY = "st_booking_v1";
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
    /* storage blocked — selection still works for this visit */
  }
  listeners.forEach((l) => l());
}

export function toggleBookingService(id: string) {
  const cur = getSnapshot();
  commit(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
}

export function setBookingServices(ids: string[]) {
  commit([...new Set(ids)]);
}

export function clearBooking() {
  commit([]);
}

/** Selected service ids (empty on the server and first paint). */
export function useBookingSelection(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
