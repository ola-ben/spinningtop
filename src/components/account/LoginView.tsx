"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { GoogleLogo, MailIcon } from "./AuthIcons";
import CodeBoxes from "@/components/CodeBoxes";
import { CODE_LENGTH, sendCode, signInWithGoogle, useUser, verifyCode } from "@/lib/user-store";
import Busy from "@/components/Busy";

const input =
  "w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/15";
const primary =
  "mt-1 w-full cursor-pointer rounded-full bg-brand py-3.5 text-sm font-bold text-paper shadow-md shadow-brand/15 transition-colors hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70";

type Mode = "signin" | "signup";

/** Seconds before another code can be sent (Supabase allows one per 60s per email). */
const RESEND_AFTER = 60;

/* /login — customers sign in or create an account with Google, or with a
   6-digit code sent to their email. No passwords (see src/lib/user-store.ts).
   A focused screen: just the logo, a close button and the sign-in card.
   ?with=email opens the email form straight away (e.g. from checkout). */
export default function LoginView() {
  const router = useRouter();
  const user = useUser();
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [wait, setWait] = useState(0);
  const [toast, setToast] = useState("");
  const [googlePending, setGooglePending] = useState(false);
  // The email form opens when "Continue with email" is clicked.
  const [showEmail, setShowEmail] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const openEmail = () => {
    setError("");
    setShowEmail(true);
    setTimeout(() => (signup ? nameRef : emailRef).current?.focus(), 50);
  };
  const codeRef = useRef<HTMLInputElement>(null);

  // The "code sent" message hides itself after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Signed in → back to where they came from (e.g. checkout), else the account page.
  useEffect(() => {
    if (!user) return;
    const next = new URLSearchParams(window.location.search).get("next") ?? "";
    router.replace(next.startsWith("/") && !next.startsWith("//") ? next : "/account/");
  }, [user, router]);

  // ?with=email → open the email form straight away.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("with") !== "email") return;
    const t = setTimeout(() => setShowEmail(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Close: back to where they came from (e.g. checkout), else home.
  const [closeHref, setCloseHref] = useState("/");
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next") ?? "";
    if (!next.startsWith("/") || next.startsWith("//")) return;
    const t = setTimeout(() => setCloseHref(next.startsWith("/checkout") ? "/shop" : next), 0);
    return () => clearTimeout(t);
  }, []);

  // Back from Google with a problem (e.g. cancelled): show it instead of failing silently.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
    const problem = params.get("error_description") ?? params.get("error");
    if (!problem) return;
    const t = setTimeout(() => setError(/denied|cancel/i.test(problem) ? "Google sign-in was cancelled." : problem.replace(/\+/g, " ")), 0);
    return () => clearTimeout(t);
  }, []);

  async function onGoogle() {
    setError("");
    setGooglePending(true);
    const err = await signInWithGoogle(new URLSearchParams(window.location.search).get("next") ?? "");
    // On success the browser goes to Google; only errors come back here.
    if (err) {
      setGooglePending(false);
      setError(err);
    }
  }

  // Resend countdown.
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const signup = mode === "signup";

  async function requestCode() {
    setError("");
    setPending(true);
    const err = await sendCode(email, { create: signup, name });
    setPending(false);
    if (err) return setError(err);
    setStep("code");
    setCode("");
    setWait(RESEND_AFTER);
    setToast(`Code sent to ${email.trim()}`);
    setTimeout(() => codeRef.current?.focus(), 50);
  }

  function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (signup && !name.trim()) return setError("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    void requestCode();
  }

  async function onCode(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setError("");
    setPending(true);
    const err = await verifyCode(email, code);
    setPending(false);
    if (err) failed(err); // success → the effect above redirects
  }

  // Wrong/expired code: show why, clear the boxes, start again from the first.
  function failed(err: string) {
    setError(err);
    setCode("");
    setTimeout(() => codeRef.current?.focus(), 50);
  }

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("email");
    setError("");
  };

  return (
    <>
      {/* Focused top bar: logo + close */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Spinning Top — home" className="inline-flex">
          <Image src="/spinning-top-logo.jpg" alt="Spinning Top" width={1168} height={424} className="h-9 w-auto" priority />
        </Link>
        <Link
          href={closeHref}
          aria-label="Close"
          className="grid h-10 w-10 place-items-center rounded-full bg-paper text-ink/70 shadow-sm transition-colors hover:text-ink"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </header>
      {/* "Code sent" toast */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4 transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        {toast && (
          <p className="flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper shadow-lg">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[11px] font-bold">✓</span>
            {toast}
          </p>
        )}
      </div>
      <main className="flex min-h-dvh items-center bg-ink/[0.04] px-4 pb-10 pt-20">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl bg-paper p-6 shadow-sm sm:p-8">
            {step === "email" ? (
              <>
                {/* Sign in / Create account switch */}
                <div className="grid grid-cols-2 rounded-full bg-ink/[0.05] p-1 text-sm font-semibold" role="tablist">
                  {(["signin", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => switchMode(m)}
                      className={`cursor-pointer rounded-full py-2 transition-colors ${
                        mode === m ? "bg-paper text-ink shadow-sm" : "text-ink/55 hover:text-ink"
                      }`}
                    >
                      {m === "signin" ? "Sign in" : "Create account"}
                    </button>
                  ))}
                </div>

                <h1 className="mt-7 font-display text-2xl font-semibold tracking-tight">{signup ? "Create your account" : "Welcome back"}</h1>
                <p className="mt-1 text-sm text-ink/55">
                  {signup
                    ? "Track orders, save your details and your wishlist. No password needed."
                    : showEmail
                      ? "Enter your email and we'll send you a 6-digit code to sign in."
                      : "Sign in to track your orders and check out faster."}
                </p>

                <button
                  type="button"
                  onClick={() => void onGoogle()}
                  disabled={googlePending}
                  className="mt-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-ink/15 bg-paper py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-ink/[0.02] disabled:cursor-wait disabled:opacity-70"
                >
                  {googlePending ? (
                    <Busy text="Opening Google" />
                  ) : (
                    <>
                      <GoogleLogo />
                      Continue with Google
                    </>
                  )}
                </button>

                {!showEmail ? (
                  <>
                    <button
                      type="button"
                      onClick={openEmail}
                      className="mt-3 flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-ink/15 bg-paper py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-ink/[0.02]"
                    >
                      <MailIcon />
                      Continue with email
                    </button>
                    {error && (
                      <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                        {error}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mt-5 flex items-center gap-3 text-xs text-ink/45" aria-hidden="true">
                      <span className="h-px flex-1 bg-ink/10" />
                      or with your email
                      <span className="h-px flex-1 bg-ink/10" />
                    </div>

                    <form onSubmit={onEmail} noValidate className="mt-5 flex flex-col gap-4">
                      {signup && (
                        <label className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium">Full name</span>
                          <input
                            ref={nameRef}
                            name="name"
                            autoComplete="name"
                            placeholder="e.g. Ada Okafor"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={input}
                          />
                        </label>
                      )}
                      <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">Email</span>
                        <input
                          ref={emailRef}
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={input}
                        />
                      </label>

                      {error && (
                        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                          {error}
                        </p>
                      )}

                      <button type="submit" disabled={pending} className={primary}>
                        {pending ? <Busy text="Sending code" /> : "Email me a code"}
                      </button>
                    </form>
                  </>
                )}
              </>
            ) : (
              <>
                <h1 className="font-display text-2xl font-semibold tracking-tight">Check your email</h1>
                <p className="mt-1 text-sm leading-relaxed text-ink/55">
                  We sent a {CODE_LENGTH}-digit code to <strong className="font-semibold text-ink">{email.trim()}</strong>. It may take a minute to
                  arrive — check spam too.
                </p>

                <form onSubmit={onCode} noValidate className="mt-6 flex flex-col gap-4">
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 text-sm font-medium">{CODE_LENGTH}-digit code</legend>
                    <CodeBoxes
                      value={code}
                      firstRef={codeRef}
                      disabled={pending}
                      onChange={(v) => {
                        setCode(v);
                        // Check automatically once all digits are in.
                        if (v.length === CODE_LENGTH && !pending) setTimeout(() => void onCodeWith(v), 0);
                      }}
                    />
                  </fieldset>

                  {error && (
                    <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                      {error}
                    </p>
                  )}

                  <button type="submit" disabled={pending} className={primary}>
                    {pending ? <Busy text="Checking code" /> : signup ? "Create account" : "Sign in"}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <button type="button" onClick={() => switchMode(mode)} className="cursor-pointer font-semibold text-brand hover:underline">
                    ← Change email
                  </button>
                  {wait > 0 ? (
                    <span className="text-ink/50">Resend code in {wait}s</span>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void requestCode()}
                      className="cursor-pointer font-semibold text-brand hover:underline disabled:opacity-50"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );

  // Verifies a specific code (used by auto-submit, since state updates are async).
  async function onCodeWith(value: string) {
    setError("");
    setPending(true);
    const err = await verifyCode(email, value);
    setPending(false);
    if (err) failed(err);
  }
}
