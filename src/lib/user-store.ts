"use client";

import { useEffect, useSyncExternalStore } from "react";
import { db, supabaseReady } from "./supabase";

/* Customer accounts — Supabase Auth with a 6-digit email code (no passwords)
   + the `profiles` table
   (supabase/customers.sql). Each customer can only read and change their own
   profile; Supabase's Row Level Security enforces that.

   The site shares one Supabase sign-in between customers and admins (it's the
   same login system); admin rights come only from the `admins` table. */

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  memberSince: string; // ISO date
  newsletter?: "daily" | "weekly" | "none";
};

type ProfileRow = { full_name: string; phone: string; address: string; newsletter: User["newsletter"] };

/* ───────────────────────── store ───────────────────────── */

let user: User | null = null;
let ready = false; // true once we know whether someone is signed in
let started = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const set = (next: User | null) => {
  user = next;
  ready = true;
  emit();
};

async function loadProfile(id: string, email: string, createdAt: string, metaName?: string) {
  const { data } = await db().from("profiles").select("full_name, phone, address, newsletter").eq("id", id).maybeSingle();
  let row = data as ProfileRow | null;
  if (!row) {
    // Accounts made before customers.sql ran (e.g. the admin) have no profile yet.
    const created = await db()
      .from("profiles")
      .insert({ id, full_name: metaName ?? "" })
      .select("full_name, phone, address, newsletter")
      .maybeSingle();
    row = (created.data as ProfileRow | null) ?? { full_name: metaName ?? "", phone: "", address: "", newsletter: "weekly" };
  }
  set({
    id,
    email,
    name: row.full_name || nameFromEmail(email),
    phone: row.phone,
    address: row.address,
    newsletter: row.newsletter ?? "weekly",
    memberSince: createdAt,
  });
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (!supabaseReady()) {
    set(null);
    return;
  }
  db().auth.onAuthStateChange((_event, session) => {
    // Run outside the auth callback (Supabase advises not awaiting inside it).
    setTimeout(() => {
      const u = session?.user;
      if (!u) return set(null);
      if (user?.id === u.id && ready) return; // token refresh — nothing changed
      loadProfile(u.id, u.email ?? "", u.created_at, u.user_metadata?.full_name).catch(() => set(null));
    }, 0);
  });
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** The signed-in customer, or null (signed out, or still checking). */
export function useUser() {
  useEffect(start, []);
  return useSyncExternalStore(subscribe, () => user, () => null);
}

/** false until the browser knows whether someone is signed in
    (so pages don't flash "signed out" while Supabase is checked). */
export function useHydrated() {
  useEffect(start, []);
  return useSyncExternalStore(subscribe, () => ready, () => false);
}

/* ───────────────────────── actions ───────────────────────── */

/** "ada.obi@mail.com" → "Ada Obi" */
const nameFromEmail = (email: string) =>
  email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ") || "Customer";

const notConfigured = "Accounts aren't available right now.";

const friendlyAuthError = (message: string) => {
  if (/signups not allowed|user not found/i.test(message)) return "There's no account with this email yet. Choose \"Create account\" instead.";
  if (/expired|invalid|token/i.test(message)) return "That code is wrong or has expired. Check the latest email, or send a new code.";
  if (/rate limit|too many|security purposes|seconds/i.test(message)) return "Please wait a minute before asking for another code.";
  if (/sending|smtp|mail/i.test(message)) return "We couldn't send the email right now. Please try again shortly.";
  return message;
};

/**
 * "Continue with Google" — goes to Google, then back to /login on this site,
 * which sends the customer on to `next` (e.g. checkout) or My Account.
 * Set up in Supabase → Authentication → Providers → Google.
 * Returns an error message if it couldn't start (otherwise the page leaves).
 */
export async function signInWithGoogle(next = ""): Promise<string | null> {
  if (!supabaseReady()) return notConfigured;
  const back = new URL("/login/", window.location.origin);
  if (next.startsWith("/") && !next.startsWith("//")) back.searchParams.set("next", next);
  const { error } = await db().auth.signInWithOAuth({ provider: "google", options: { redirectTo: back.toString() } });
  if (!error) return null;
  return /provider is not enabled|unsupported provider/i.test(error.message)
    ? "Google sign-in isn't switched on yet. Use your email instead."
    : error.message;
}

/** Code length set in Supabase (Authentication → Providers → Email → Email OTP Length). */
export const CODE_LENGTH = 6;

/**
 * Emails a 6-digit sign-in code.
 * - Sign in: `create` false — only works for existing accounts.
 * - Create account: `create` true with the customer's name — makes the account
 *   (or just signs in if the email already has one).
 * Returns an error message, or null when the code was sent.
 */
export async function sendCode(email: string, opts: { create: boolean; name?: string }): Promise<string | null> {
  if (!supabaseReady()) return notConfigured;
  const { error } = await db().auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: opts.create,
      ...(opts.create && opts.name ? { data: { full_name: opts.name.trim() } } : {}),
    },
  });
  return error ? friendlyAuthError(error.message) : null;
}

/** Checks the emailed code; signs the customer in when it's right. Returns an error message, or null. */
export async function verifyCode(email: string, code: string): Promise<string | null> {
  if (!supabaseReady()) return notConfigured;
  const token = code.replace(/\D/g, "");
  if (token.length !== CODE_LENGTH) return `Enter the ${CODE_LENGTH}-digit code from the email.`;
  const { error } = await db().auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: "email" });
  return error ? friendlyAuthError(error.message) : null;
}

export async function signOut() {
  if (supabaseReady()) await db().auth.signOut();
  set(null);
}

/** Saves profile changes. Returns an error message, or null. */
export async function updateUser(patch: Partial<Pick<User, "name" | "phone" | "address" | "newsletter">>): Promise<string | null> {
  if (!user) return "You're signed out. Please sign in again.";
  const row: Record<string, string> = {};
  if (patch.name !== undefined) row.full_name = patch.name;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.newsletter !== undefined) row.newsletter = patch.newsletter;
  const { error } = await db().from("profiles").update(row).eq("id", user.id);
  if (error) return "Could not save. Please try again.";
  set({ ...user, ...patch });
  return null;
}

/** Permanently deletes the signed-in customer's account. Returns an error message, or null. */
export async function closeAccount(): Promise<string | null> {
  const { error } = await db().rpc("delete_my_account");
  if (error) return /admin/i.test(error.message) ? "Admin accounts can't be closed here." : "Could not close the account. Please try again.";
  await db().auth.signOut();
  set(null);
  return null;
}

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";
