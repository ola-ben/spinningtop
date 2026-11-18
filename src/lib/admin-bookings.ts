"use client";

import { useEffect, useSyncExternalStore } from "react";
import { BOOKING_PHOTO_BUCKET, LOGISTICS_OPTIONS, type Logistics } from "./booking-data";
import { db, supabaseReady } from "./supabase";

/* Service bookings for the admin (supabase/bookings.sql + bookings-admin.sql).
   Shared by the Bookings screen, the dashboard and the sidebar badge;
   re-checked every minute while the admin is open. */

export const BOOKING_STATUSES = ["New", "Contacted", "Quoted", "Scheduled", "In progress", "Completed", "Cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type Booking = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  area: string;
  serviceNames: string[];
  logistics: Logistics;
  notes: string;
  photos: string[];
  status: BookingStatus;
  adminNote: string;
  createdAt: string;
  history: { status: BookingStatus; note: string; at: string }[];
};

type Row = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  area: string;
  service_names: string[];
  logistics: Logistics;
  notes: string;
  photos: string[];
  status: BookingStatus;
  admin_note: string;
  created_at: string;
  booking_status_history: { status: BookingStatus; note: string; created_at: string }[];
};

export const logisticsLabel = (l: Logistics) => LOGISTICS_OPTIONS.find((o) => o.value === l)?.label ?? (l === "either" ? "Either is fine" : l);

const friendly = (m: string) =>
  /does not exist|schema cache/i.test(m)
    ? "Bookings aren't set up yet — run supabase/bookings.sql and supabase/bookings-admin.sql in Supabase."
    : m;

async function listBookings(): Promise<Booking[]> {
  const { data, error } = await db()
    .from("bookings")
    .select("*, booking_status_history(status, note, created_at)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(friendly(error.message));
  return (data as Row[]).map((r) => ({
    id: r.id,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    area: r.area,
    serviceNames: r.service_names ?? [],
    logistics: r.logistics,
    notes: r.notes,
    photos: r.photos ?? [],
    status: r.status,
    adminNote: r.admin_note,
    createdAt: r.created_at,
    history: (r.booking_status_history ?? [])
      .map((h) => ({ status: h.status, note: h.note, at: h.created_at }))
      .sort((a, b) => a.at.localeCompare(b.at)),
  }));
}

export async function setBookingStatus(id: string, status: BookingStatus, note = ""): Promise<string | null> {
  const { error } = await db().rpc("admin_set_booking_status", { p_booking_id: id, p_status: status, p_note: note });
  return error ? friendly(error.message) : null;
}

export async function setBookingNote(id: string, note: string): Promise<string | null> {
  const { error } = await db().rpc("admin_set_booking_note", { p_booking_id: id, p_note: note });
  return error ? friendly(error.message) : null;
}

/** Short-lived links to view a booking's private photos. */
export async function bookingPhotoUrls(paths: string[]): Promise<string[]> {
  if (!paths.length) return [];
  const { data } = await db().storage.from(BOOKING_PHOTO_BUCKET).createSignedUrls(paths, 60 * 60);
  return (data ?? []).map((d) => d.signedUrl).filter((u): u is string => !!u);
}

/* ── shared store ── */
type State = { bookings: Booking[] | null; error: string };
let state: State = { bookings: null, error: "" };
let loading: Promise<void> | null = null;
let polling = false;
const listeners = new Set<() => void>();
const SERVER: State = { bookings: null, error: "" };

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

export function loadAdminBookings(force = false) {
  if (!supabaseReady()) return Promise.resolve();
  if (loading && !force) return loading;
  loading = listBookings()
    .then((bookings) => set({ bookings, error: "" }))
    .catch((err) => {
      set({ error: err instanceof Error ? err.message : "Could not load bookings." });
      loading = null;
    });
  return loading;
}

export function useAdminBookings() {
  const s = useSyncExternalStore(subscribe, () => state, () => SERVER);
  useEffect(() => {
    void loadAdminBookings();
    if (!polling) {
      polling = true;
      setInterval(() => {
        if (document.visibilityState === "visible") void loadAdminBookings(true);
      }, 60_000);
    }
  }, []);
  const bookings = s.bookings ?? [];
  return {
    bookings,
    loading: s.bookings === null && !s.error,
    error: s.error,
    /** Requests nobody has contacted yet. */
    newCount: bookings.filter((b) => b.status === "New").length,
    reload: () => loadAdminBookings(true),
  };
}
