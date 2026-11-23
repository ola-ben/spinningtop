"use client";

import { useEffect, useSyncExternalStore } from "react";
import { listOrders, type Order } from "./order-data";
import { supabaseReady } from "./supabase";
import { ORDERS_SEEN, countUnseen, useSeenAt } from "./admin-seen";

/* All orders for the admin (shared by Orders, the dashboard and the sidebar
   badge). Re-checked every minute while the admin is open, so new orders
   appear without reloading. */

type State = { orders: Order[] | null; error: string };
let state: State = { orders: null, error: "" };
let loading: Promise<void> | null = null;
let polling = false;
const listeners = new Set<() => void>();
const SERVER: State = { orders: null, error: "" };

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

export function loadAdminOrders(force = false) {
  if (!supabaseReady()) return Promise.resolve();
  if (loading && !force) return loading;
  loading = listOrders()
    .then((orders) => set({ orders, error: "" }))
    .catch((err) => {
      set({ error: err instanceof Error ? err.message : "Could not load orders." });
      loading = null;
    });
  return loading;
}

function startPolling() {
  if (polling) return;
  polling = true;
  setInterval(() => {
    if (document.visibilityState === "visible") void loadAdminOrders(true);
  }, 60_000);
}

export function useAdminOrders() {
  const s = useSyncExternalStore(subscribe, () => state, () => SERVER);
  const seenAt = useSeenAt(ORDERS_SEEN);
  useEffect(() => {
    void loadAdminOrders();
    startPolling();
  }, []);
  const orders = s.orders ?? [];
  return {
    orders,
    loading: s.orders === null && !s.error,
    error: s.error,
    /** Orders waiting for the team to confirm them. */
    toConfirm: orders.filter((o) => o.status === "Received").length,
    /** New orders since Product orders was last opened (the badge). */
    unseen: countUnseen(orders, seenAt, (o) => o.createdAt, (o) => o.status === "Received"),
    reload: () => loadAdminOrders(true),
  };
}
