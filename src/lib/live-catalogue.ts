"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Product } from "./shop-data";
import type { Service } from "./services-data";
import { rowToProduct, rowToService, type ProductRow, type ServiceRow } from "./catalogue-rows";
import { db, supabaseReady } from "./supabase";

/* LIVE catalogue in the browser. Pages are built with the catalogue as it was
   at build time; these hooks fetch the current published products, services
   and shop switch from Supabase once per page load, so changes made in /admin
   show without rebuilding the site. Until the fetch finishes (or if it fails)
   the build-time data is shown. */

type Live = {
  products: Product[] | null;
  services: Service[] | null;
  showProducts: boolean | null;
};

let state: Live = { products: null, services: null, showProducts: null };
const listeners = new Set<() => void>();
const started = new Set<keyof Live>();

const set = (patch: Partial<Live>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const SERVER: Live = { products: null, services: null, showProducts: null };
const useLive = () => useSyncExternalStore(subscribe, () => state, () => SERVER);

async function load(key: keyof Live) {
  if (started.has(key) || !supabaseReady()) return;
  started.add(key);
  try {
    if (key === "products") {
      const { data, error } = await db().from("products").select("*").eq("status", "published").order("sort_order").order("name");
      if (!error) set({ products: (data as ProductRow[]).map(rowToProduct) });
    } else if (key === "services") {
      const { data, error } = await db().from("services").select("*").eq("status", "published").order("sort_order").order("name");
      if (!error) set({ services: (data as ServiceRow[]).map(rowToService) });
    } else {
      const { data, error } = await db().from("site_settings").select("value").eq("key", "shop").maybeSingle();
      if (!error && data) set({ showProducts: !!(data.value as { showProducts?: boolean }).showProducts });
    }
  } catch {
    // Offline or Supabase unreachable — keep showing the build-time data.
  } finally {
    // Allow another try on the next page that asks.
    if (state[key] === null) started.delete(key);
  }
}

/** Published products: live from Supabase once loaded, build-time list until then. */
export function useLiveProducts(initial: Product[]) {
  const live = useLive();
  useEffect(() => void load("products"), []);
  return { products: live.products ?? initial, loaded: live.products !== null };
}

/** Published services: live from Supabase once loaded, build-time list until then. */
export function useLiveServices(initial: Service[]) {
  const live = useLive();
  useEffect(() => void load("services"), []);
  return { services: live.services ?? initial, loaded: live.services !== null };
}

/** The /admin shop on/off switch: live once loaded, build-time value until then. */
export function useLiveShopSwitch(initial: boolean) {
  const live = useLive();
  useEffect(() => void load("showProducts"), []);
  return { showProducts: live.showProducts ?? initial, loaded: live.showProducts !== null };
}

/** Called by the admin after a change, so the next page shows fresh data. */
export function resetLiveCatalogue() {
  started.clear();
  set({ products: null, services: null, showProducts: null });
}
