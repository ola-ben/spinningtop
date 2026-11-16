"use client";

import { useEffect, useState } from "react";
import { db, supabaseReady } from "./supabase";

/* Admin sign-in with Supabase Auth (email + password).

   Create admin accounts in Supabase → Authentication → Users, then add them
   to the admins table (see supabase/admin-access.sql). Signing in only
   proves who you are; Supabase's Row Level Security is what actually allows
   or blocks every change, so hiding the admin pages is just for convenience. */

export type AdminStatus = "loading" | "signed-out" | "not-admin" | "admin";

async function checkAdmin(): Promise<boolean> {
  const { data, error } = await db().rpc("is_admin");
  return !error && data === true;
}

export function useAdminSession() {
  const [status, setStatus] = useState<AdminStatus>(() => (supabaseReady() ? "loading" : "signed-out"));
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseReady()) return;
    let active = true;
    const update = async (userEmail: string | null) => {
      if (!userEmail) {
        if (active) {
          setEmail(null);
          setStatus("signed-out");
        }
        return;
      }
      const ok = await checkAdmin();
      if (active) {
        setEmail(userEmail);
        setStatus(ok ? "admin" : "not-admin");
      }
    };
    const { data } = db().auth.onAuthStateChange((_event, session) => {
      // Run outside the auth callback (Supabase recommends not awaiting inside it).
      setTimeout(() => void update(session?.user.email ?? null), 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { status, email };
}

/** Returns an error message, or null when signed in as an admin. */
export async function signInAdmin(email: string, password: string): Promise<string | null> {
  if (!supabaseReady()) return "Supabase isn't configured for this site.";
  const { error } = await db().auth.signInWithPassword({ email, password });
  if (error) return error.message === "Invalid login credentials" ? "Wrong email or password." : error.message;
  if (!(await checkAdmin())) {
    await db().auth.signOut();
    return "This account isn't an admin.";
  }
  return null;
}

export async function signOutAdmin() {
  if (supabaseReady()) await db().auth.signOut();
}
