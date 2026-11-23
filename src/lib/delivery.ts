"use client";

import { useCallback, useEffect, useState } from "react";
import { db, supabaseReady } from "./supabase";

/* Delivery areas and prices (supabase/delivery.sql).
   Holt has no API, so the admin keeps a list of areas + fees on Admin → Delivery.
   Kwik will be connected through their API later (shown as "coming soon"). */

export type Courier = "holt" | "kwik";

export const COURIERS: { id: Courier; name: string; note: string; comingSoon?: boolean }[] = [
  { id: "holt", name: "Holt", note: "Fixed price by area" },
  { id: "kwik", name: "Kwik", note: "Coming soon", comingSoon: true },
];

export const courierName = (id: string) => COURIERS.find((c) => c.id === id)?.name ?? id;

export type DeliveryZone = { id: string; courier: Courier; area: string; price: number; active: boolean; sortOrder: number };

type Row = { id: string; courier: Courier; area: string; price: number; active: boolean; sort_order: number };
const toZone = (r: Row): DeliveryZone => ({ id: r.id, courier: r.courier, area: r.area, price: r.price, active: r.active, sortOrder: r.sort_order });

const friendly = (m: string) =>
  /delivery_zones/.test(m) && /does not exist|schema cache/i.test(m)
    ? "Delivery areas aren't set up yet — run supabase/delivery.sql in Supabase."
    : m;

async function fetchZones(): Promise<{ zones: DeliveryZone[]; error: string }> {
  if (!supabaseReady()) return { zones: [], error: "" };
  const { data, error } = await db().from("delivery_zones").select("*").order("sort_order").order("area");
  if (error) return { zones: [], error: friendly(error.message) };
  return { zones: (data as Row[]).map(toZone), error: "" };
}

/**
 * Delivery areas. Customers only get the active ones (Supabase rules);
 * team members who manage delivery get all of them.
 */
export function useDeliveryZones() {
  const [state, setState] = useState<{ zones: DeliveryZone[]; error: string; loading: boolean }>({ zones: [], error: "", loading: true });

  const reload = useCallback(async () => {
    const res = await fetchZones();
    setState({ ...res, loading: false });
  }, []);

  useEffect(() => {
    let active = true;
    void fetchZones().then((res) => {
      if (active) setState({ ...res, loading: false });
    });
    return () => {
      active = false;
    };
  }, []);

  return { ...state, reload };
}

/* ───────────────────────── admin ───────────────────────── */

/** Adds (no id) or updates an area. Returns an error message or null. */
export async function saveZone(z: { id?: string; area: string; price: number; active?: boolean; sortOrder?: number }): Promise<string | null> {
  const area = z.area.trim();
  if (area.length < 2) return "Enter the area name.";
  if (!Number.isFinite(z.price) || z.price < 0) return "Enter a price of ₦0 or more.";
  const row = { area, price: Math.round(z.price), ...(z.active === undefined ? {} : { active: z.active }) };
  const { data, error } = z.id
    ? await db().from("delivery_zones").update(row).eq("id", z.id).select("id")
    : await db()
        .from("delivery_zones")
        .insert({ courier: "holt", ...row, sort_order: z.sortOrder ?? 0 })
        .select("id");
  if (error) return /duplicate|unique/i.test(error.message) ? `"${area}" is already on the list.` : friendly(error.message);
  return data?.length ? null : "Not allowed — your role can't change delivery settings.";
}

export async function deleteZone(id: string): Promise<string | null> {
  const { data, error } = await db().from("delivery_zones").delete().eq("id", id).select("id");
  if (error) return friendly(error.message);
  return data?.length ? null : "Not allowed — your role can't change delivery settings.";
}
