"use client";

import { useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/admin/PasswordInput";
import { btn, inputClass } from "@/components/admin/ui";
import { signInAdmin } from "@/lib/admin-auth";
import Busy from "@/components/Busy";

/* Admin sign-in with a Supabase account (Authentication → Users) that is
   listed in the admins table — see supabase/admin-access.sql.
   After signing in you return to the admin page you were trying to open. */
export default function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "";
  const [error, action, pending] = useActionState<string | null, FormData>(async (_prev, formData) => {
    const err = await signInAdmin(String(formData.get("email") ?? "").trim(), String(formData.get("password") ?? ""));
    if (err) return err;
    router.replace(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin/");
    return null;
  }, null);

  return (
    <form action={action} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Email</span>
        <input name="email" type="email" autoComplete="email" placeholder="Your email address" required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Password</span>
        <PasswordInput name="password" autoComplete="current-password" placeholder="Enter your password" required />
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3 disabled:cursor-wait disabled:opacity-70`}>
        {pending ? <Busy text="Signing in" /> : "Sign in"}
      </button>
    </form>
  );
}
