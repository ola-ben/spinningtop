import { db, supabaseReady } from "./supabase";

/* Service booking requests (supabase/bookings.sql). No sign-in needed. */

export const BOOKING_PHOTO_BUCKET = "booking-photos";
export const MAX_BOOKING_PHOTOS = 4;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export type Logistics = "pickup_delivery" | "drop_off" | "either";

export const LOGISTICS_OPTIONS: { value: Logistics; label: string }[] = [
  { value: "pickup_delivery", label: "I prefer pickup & delivery" },
  { value: "drop_off", label: "I will drop off at your location" },
];

export type NewBooking = {
  fullName: string;
  phone: string;
  email: string;
  area: string;
  services: string[];
  logistics: Logistics;
  /** Drop-off outlet name (BRANCHES in site.ts), when logistics is "drop_off". */
  outlet: string;
  notes: string;
  photos: File[];
};

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) : "jpg";
  return `photo-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;
}

async function uploadPhotos(files: File[]): Promise<{ paths?: string[]; error?: string }> {
  if (files.length === 0) return { paths: [] };
  const folder = `pending/${crypto.randomUUID()}`;
  const paths: string[] = [];
  for (const file of files) {
    const path = `${folder}/${safeName(file.name)}`;
    const { error } = await db().storage.from(BOOKING_PHOTO_BUCKET).upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (error) return { error: "A photo couldn't be uploaded. Use a JPG or PNG under 10 MB, or send without photos." };
    paths.push(path);
  }
  return { paths };
}

export async function createBooking(b: NewBooking): Promise<{ id?: string; error?: string }> {
  if (!supabaseReady()) return { error: "Booking isn't available right now. Please call us." };
  const up = await uploadPhotos(b.photos);
  if (up.error) return { error: up.error };
  const { data, error } = await db().rpc("create_booking", {
    p_full_name: b.fullName,
    p_phone: b.phone,
    p_email: b.email,
    p_area: b.area,
    p_services: b.services,
    p_logistics: b.logistics,
    p_notes: b.notes,
    p_photos: up.paths,
    p_outlet: b.logistics === "drop_off" ? b.outlet : "",
  });
  // Messages raised by create_booking are already customer-friendly sentences.
  if (error) return { error: /^[A-Z][^\n]{5,120}\.$/.test(error.message) ? error.message : "Could not send your request. Please try again." };
  return { id: data as string };
}
