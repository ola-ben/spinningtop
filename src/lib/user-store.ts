import { useSyncExternalStore } from "react";

/* Customer account — DEMO ONLY.
   Any email + password "signs in": a demo profile is saved in this
   browser's localStorage (same approach as cart and wishlist). Nothing is
   checked or sent anywhere. Replace signIn / signOut / updateUser with the
   real backend (e.g. Supabase Auth + a profiles table) when it's ready. */

export type User = {
  name: string;
  email: string;
  phone: string;
  address: string;
  memberSince: string; // ISO date
  newsletter?: "daily" | "weekly" | "none";
};

const KEY = "st_user_v1";

let cache: User | null | undefined;
const listeners = new Set<() => void>();

function load(): User | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return parsed && typeof parsed.email === "string" ? (parsed as User) : null;
  } catch {
    return null;
  }
}

function getSnapshot() {
  if (cache === undefined) cache = load();
  return cache;
}

const getServerSnapshot = () => null;

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = undefined;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(next: User | null) {
  cache = next;
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked — signed in for this visit only */
  }
  listeners.forEach((l) => l());
}

/** "ada.obi@mail.com" → "Ada Obi" */
const nameFromEmail = (email: string) =>
  email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ") || "Customer";

/** Demo sign-in: accepts any email/password and fills in demo details. */
export function signIn(email: string, name?: string) {
  commit({
    name: name?.trim() || nameFromEmail(email),
    email: email.trim().toLowerCase(),
    phone: "0803 123 4567",
    address: "12 Oluyole Estate, Ibadan, Oyo State",
    memberSince: new Date().toISOString(),
  });
}

export const signOut = () => commit(null);

export function updateUser(patch: Partial<Omit<User, "memberSince">>) {
  const current = getSnapshot();
  if (current) commit({ ...current, ...patch });
}

export function useUser() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

const noop = () => () => {};
/** false during server render / hydration, true once the browser has taken over
    (so pages don't flash "signed out" before localStorage is read). */
export const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
