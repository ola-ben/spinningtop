"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import PasswordInput from "@/components/admin/PasswordInput";
import { btn, inputClass } from "@/components/admin/ui";

/* UI only for now. When the backend lands, replace the body of onSubmit with
   the real sign-in call (e.g. supabase.auth.signInWithPassword) and show its
   error message in `error`. */
export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setError("");
    setPending(true);
    // No auth yet — go straight to the dashboard.
    router.push("/admin");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Email</span>
        <input name="email" type="email" autoComplete="email" placeholder="you@spinningtop.ng" required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center justify-between text-sm font-medium">
          Password
          <Link href="/admin/login" className="text-xs font-semibold text-brand hover:underline">
            Forgot password?
          </Link>
        </span>
        <PasswordInput name="password" autoComplete="current-password" placeholder="Enter your password" required />
      </label>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/70">
        <input type="checkbox" name="remember" className="h-4 w-4 accent-[var(--color-brand)]" />
        Keep me signed in
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3 disabled:cursor-wait disabled:opacity-70`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
