"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import SiteHeader from "@/components/SiteHeader";
import PasswordInput from "@/components/admin/PasswordInput";
import { signIn, useUser } from "@/lib/user-store";

const input =
  "w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/15";

/* /login — customer sign in / create account. DEMO: any details work. */
export default function LoginView() {
  const router = useRouter();
  const user = useUser();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");

  // Already signed in → straight to the account page.
  useEffect(() => {
    if (user) router.replace("/account");
  }, [user, router]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (mode === "signup" && !name.trim()) return setError("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (!password) return setError("Enter a password.");
    setError("");
    signIn(email, name); // demo: always succeeds — the effect above redirects
  }

  const signup = mode === "signup";

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-ink/[0.03] px-4 py-10 sm:py-16">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl bg-paper p-6 shadow-sm sm:p-8">
            {/* Sign in / Create account switch */}
            <div className="grid grid-cols-2 rounded-full bg-ink/[0.05] p-1 text-sm font-semibold" role="tablist">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  className={`cursor-pointer rounded-full py-2 transition-colors ${
                    mode === m ? "bg-paper text-ink shadow-sm" : "text-ink/55 hover:text-ink"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <h1 className="mt-7 font-display text-2xl font-semibold tracking-tight">
              {signup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1 text-sm text-ink/55">
              {signup ? "Track orders, save your details and your wishlist." : "Sign in to see your orders and profile."}
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
              {signup && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Full name</span>
                  <input name="name" autoComplete="name" placeholder="e.g. Ada Okafor" className={input} />
                </label>
              )}
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Email</span>
                <input name="email" type="email" autoComplete="email" placeholder="you@example.com" className={input} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="flex items-center justify-between text-sm font-medium">
                  Password
                  {!signup && <span className="text-xs font-semibold text-brand">Forgot password?</span>}
                </span>
                <PasswordInput
                  name="password"
                  autoComplete={signup ? "new-password" : "current-password"}
                  placeholder={signup ? "Create a password" : "Enter your password"}
                  className="py-3"
                />
              </label>

              {error && (
                <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="mt-1 w-full cursor-pointer rounded-full bg-brand py-3.5 text-sm font-bold text-paper shadow-md shadow-brand/15 transition-colors hover:bg-brand-deep"
              >
                {signup ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="mt-5 rounded-xl bg-tint px-3.5 py-3 text-xs leading-relaxed text-ink/65">
              <strong className="font-semibold text-ink">Demo:</strong> any email and password will sign you in. Your
              details are saved on this device only.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-ink/55">
            Just browsing?{" "}
            <Link href="/shop" className="font-semibold text-brand hover:underline">
              Continue to the shop
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
