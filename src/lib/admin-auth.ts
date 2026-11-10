import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* Minimal single-password admin login.
   Set ADMIN_PASSWORD in .env.local (and in your host's environment variables).
   The cookie holds an HMAC derived from the password, so changing the
   password signs everyone out. */

export const ADMIN_COOKIE = "st_admin";
const SESSION_HOURS = 8;

const password = () => process.env.ADMIN_PASSWORD ?? "";

export const adminConfigured = () => password().length > 0;

const sessionToken = () => createHmac("sha256", password()).update("spinningtop-admin-v1").digest("hex");

const sameText = (a: string, b: string) => {
  // Hash first so lengths match and comparison time doesn't leak anything.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export function passwordMatches(attempt: string) {
  return adminConfigured() && sameText(attempt, password());
}

/** True if the current request carries a valid admin session. */
export async function isAdmin() {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!value && sameText(value, sessionToken());
}

export async function startAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
