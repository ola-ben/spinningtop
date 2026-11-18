"use client";

import { useEffect, useSyncExternalStore } from "react";
import { db, supabaseReady } from "./supabase";

/* Customers for the admin — read with supabase.rpc("admin_list_customers")
   (supabase/customers-admin.sql), which only answers admins.

   "New" = signed up since the admin last opened the Customers page (remembered
   in this browser), so the sidebar badge shows who you haven't seen yet. */

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  newsletter: "daily" | "weekly" | "none";
  joined: string; // ISO
  lastSignIn: string | null; // ISO
};

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  newsletter: AdminCustomer["newsletter"];
  created_at: string;
  last_sign_in_at: string | null;
};

type State = { customers: AdminCustomer[] | null; error: string; lastSeen: string | null; loadedAt: number };

const SEEN_KEY = "st_admin_customers_seen";
let state: State = { customers: null, error: "", lastSeen: null, loadedAt: 0 };
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const SERVER: State = { customers: null, error: "", lastSeen: null, loadedAt: 0 };

/** When the admin last opened Customers in this browser (null = never). */
export function readSeen() {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
}

/** Loads (or reloads) the customer list from Supabase. */
export function loadCustomers(force = false) {
  if (!supabaseReady()) return Promise.resolve();
  if (loading && !force) return loading;
  if (state.lastSeen === null) set({ lastSeen: readSeen() ?? "" });
  loading = (async () => {
    const { data, error } = await db().rpc("admin_list_customers");
    if (error) {
      set({ error: /admin_list_customers/.test(error.message) ? "Run supabase/customers-admin.sql in Supabase first." : error.message });
      loading = null;
      return;
    }
    set({
      error: "",
      loadedAt: Date.now(),
      customers: ((data ?? []) as Row[]).map((r) => ({
        id: r.id,
        name: r.full_name,
        email: r.email,
        phone: r.phone,
        address: r.address,
        newsletter: r.newsletter,
        joined: r.created_at,
        lastSignIn: r.last_sign_in_at,
      })),
    });
  })();
  return loading;
}

// While the admin is open, check for new sign-ups every minute (one timer for the whole admin).
let polling = false;
function startPolling() {
  if (polling) return;
  polling = true;
  setInterval(() => {
    if (document.visibilityState === "visible") void loadCustomers(true);
  }, 60_000);
}

/** All customers (newest first) + how many are new since the last visit. */
export function useAdminCustomers() {
  const s = useSyncExternalStore(subscribe, () => state, () => SERVER);
  useEffect(() => {
    void loadCustomers();
    startPolling();
  }, []);
  const seen = s.lastSeen ? Date.parse(s.lastSeen) : 0;
  const customers = s.customers ?? [];
  return {
    customers,
    loading: s.customers === null && !s.error,
    error: s.error,
    /** Signed up since the admin last opened Customers (everyone, on first visit). */
    isNew: (c: AdminCustomer) => Date.parse(c.joined) > seen,
    newCount: customers.filter((c) => Date.parse(c.joined) > seen).length,
    /** Signed up in the 7 days before the list was loaded. */
    joinedThisWeek: customers.filter((c) => s.loadedAt - Date.parse(c.joined) < 7 * 24 * 60 * 60 * 1000).length,
    reload: () => loadCustomers(true),
  };
}

/** Remember that the admin has now seen everyone on the list. */
export function markCustomersSeen() {
  const now = new Date().toISOString();
  try {
    localStorage.setItem(SEEN_KEY, now);
  } catch {
    /* storage blocked — badge just won't remember */
  }
  set({ lastSeen: now });
}
