"use client";

import { useEffect, useSyncExternalStore } from "react";
import { db, supabaseReady } from "./supabase";

/* Admin sign-in with Supabase Auth (email + password).

   Team members are listed in the admins table (supabase/admin-access.sql).
   The Owner adds workers by email on Team & roles; a worker joins by signing in
   with a 6-digit email code and choosing a password (supabase/team-roles.sql).
   Each worker's role decides what they can see and do. Supabase's Row Level
   Security checks the same permissions on every change, so hiding pages and
   buttons here is just for convenience. */

export type AdminStatus = "loading" | "signed-out" | "not-admin" | "admin";

/** Everything a role can be allowed to do (ticks on Team & roles). */
export type Permission =
  | "orders.view"
  | "orders.update"
  | "orders.cancel"
  | "orders.payment"
  | "customers.view"
  | "products.view"
  | "products.edit"
  | "products.delete"
  | "services.view"
  | "services.edit"
  | "services.delete"
  | "reviews.view"
  | "academy.view"
  | "dashboard.sales"
  | "settings.manage"
  | "delivery.manage";

/** "owner" = only Owners (e.g. managing the team). */
export type Access = Permission | "owner";

type State = {
  status: AdminStatus;
  email: string | null;
  isOwner: boolean;
  role: string;
  permissions: Permission[];
};

const SIGNED_OUT: State = { status: "signed-out", email: null, isOwner: false, role: "", permissions: [] };
const SERVER: State = { ...SIGNED_OUT, status: "loading" };
let state: State = SERVER;
let started = false;
const listeners = new Set<() => void>();

const set = (next: State) => {
  state = next;
  listeners.forEach((l) => l());
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

type AccessRow = { is_owner: boolean; role: string | null; permissions: Permission[] } | null;

/** Reads the signed-in user's team access (null = not on the team). */
async function readAccess(): Promise<AccessRow> {
  const { data, error } = await db().rpc("admin_my_access");
  if (!error) return (data as AccessRow) ?? null;
  // Before team-roles.sql has been run: fall back to the old admin check (full access).
  const { data: isAdmin } = await db().rpc("is_admin");
  return isAdmin === true ? { is_owner: true, role: "Owner", permissions: [] } : null;
}

async function refresh(email: string | null) {
  if (!email) return set(SIGNED_OUT);
  const access = await readAccess();
  set(
    access
      ? { status: "admin", email, isOwner: access.is_owner, role: access.role || "Team", permissions: access.permissions ?? [] }
      : { ...SIGNED_OUT, status: "not-admin", email },
  );
}

function start() {
  if (started) return;
  started = true;
  if (!supabaseReady()) return set(SIGNED_OUT);
  db().auth.onAuthStateChange((event, session) => {
    // A new password doesn't change who you are or what you can do.
    if (event === "USER_UPDATED" && state.status === "admin") return;
    // Run outside the auth callback (Supabase recommends not awaiting inside it).
    setTimeout(() => void refresh(session?.user.email ?? null), 0);
  });
}

/** Sign-in state + what the signed-in team member may do. */
export function useAdminSession() {
  useEffect(start, []);
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER,
  );
  const can = (p: Access) => s.status === "admin" && (s.isOwner || (p !== "owner" && s.permissions.includes(p)));
  return { status: s.status, email: s.email, isOwner: s.isOwner, role: s.role, can };
}

/** What you need to open each admin page (null = every team member). */
const ROUTES: [string, Access][] = [
  ["/admin/products/new", "products.edit"],
  ["/admin/products/edit", "products.edit"],
  ["/admin/products", "products.view"],
  ["/admin/services/new", "services.edit"],
  ["/admin/services/edit", "services.edit"],
  ["/admin/services", "services.view"],
  ["/admin/orders", "orders.view"],
  ["/admin/customers", "customers.view"],
  ["/admin/reviews", "reviews.view"],
  ["/admin/academy", "academy.view"],
  ["/admin/team", "owner"],
  ["/admin/settings", "settings.manage"],
  ["/admin/delivery", "delivery.manage"],
];

export function routeAccess(pathname: string): Access | null {
  const path = pathname.replace(/\/$/, "");
  return ROUTES.find(([href]) => path === href || path.startsWith(`${href}/`))?.[1] ?? null;
}

/** Re-reads your access (e.g. after the Owner changed your role). */
export const reloadAdminAccess = () => refresh(state.email);

const friendly = (message: string) => {
  if (/invalid login credentials/i.test(message)) return "Wrong email or password.";
  if (/expired|invalid|token/i.test(message)) return "That code is wrong or has expired. Check the latest email, or send a new code.";
  if (/rate limit|too many|security purposes|seconds/i.test(message)) return "Please wait a minute before asking for another code.";
  if (/sending|smtp|mail/i.test(message)) return "We couldn't send the email right now. Please try again shortly.";
  if (/should be at least|password.*characters/i.test(message)) return "Use at least 8 characters for your password.";
  if (/different from the old/i.test(message)) return "Choose a password you haven't used here before.";
  return message;
};

/** Joins the team if this email was invited. True when on the team. */
async function claimInvite(): Promise<boolean> {
  const { data, error } = await db().rpc("claim_admin_invite");
  if (!error) return data === true;
  const { data: isAdmin } = await db().rpc("is_admin"); // before team-roles.sql
  return isAdmin === true;
}

/** Returns an error message, or null when signed in as a team member. */
export async function signInAdmin(email: string, password: string): Promise<string | null> {
  if (!supabaseReady()) return "Supabase isn't configured for this site.";
  const { error } = await db().auth.signInWithPassword({ email, password });
  if (error) return friendly(error.message);
  if (!(await claimInvite())) {
    await db().auth.signOut();
    return "This email isn't on the Spinning Top team. Ask the owner to add you on Team & roles.";
  }
  await refresh(email);
  return null;
}

/* ── First time / forgot password: email code → choose a password ── */

/** Emails a 6-digit code. Returns an error message, or null when sent. */
export async function sendAdminCode(email: string): Promise<string | null> {
  if (!supabaseReady()) return "Supabase isn't configured for this site.";
  const { error } = await db().auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
  return error ? friendly(error.message) : null;
}

/** Checks the code and joins the team. Returns an error message, or null. */
export async function verifyAdminCode(email: string, code: string): Promise<string | null> {
  const { error } = await db().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: "email" });
  if (error) return friendly(error.message);
  if (!(await claimInvite())) {
    await db().auth.signOut();
    return "This email isn't on the Spinning Top team. Ask the owner to add you on Team & roles.";
  }
  return null;
}

/** Sets the signed-in team member's password (and their name, if given). */
export async function setAdminPassword(password: string, name?: string): Promise<string | null> {
  const { data, error } = await db().auth.updateUser({ password, ...(name ? { data: { full_name: name } } : {}) });
  if (error) return friendly(error.message);
  if (name && data.user) await db().from("profiles").update({ full_name: name }).eq("id", data.user.id);
  await refresh(data.user?.email ?? state.email);
  return null;
}

export async function signOutAdmin() {
  if (supabaseReady()) await db().auth.signOut();
}
