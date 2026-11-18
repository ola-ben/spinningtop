"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import SiteHeader from "@/components/SiteHeader";
import { CODE_LENGTH, sendCode, useUser, verifyCode } from "@/lib/user-store";
import Busy from "@/components/Busy";

const input =
  "w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/15";
const primary =
  "mt-1 w-full cursor-pointer rounded-full bg-brand py-3.5 text-sm font-bold text-paper shadow-md shadow-brand/15 transition-colors hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70";

type Mode = "signin" | "signup";

/** Seconds before another code can be sent (Supabase allows one per 60s per email). */
const RESEND_AFTER = 60;

/* /login — customers sign in or create an account with a 6-digit code sent
   to their email. No passwords (see src/lib/user-store.ts). */
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
      <SiteHeader />
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
      <main className="min-h-[70vh] bg-ink/[0.03] px-4 py-10 sm:py-16">
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

                <h1 className="mt-7 font-display text-2xl font-semibold tracking-tight">
                  {signup ? "Create your account" : "Welcome back"}
                </h1>
                <p className="mt-1 text-sm text-ink/55">
                  {signup
                    ? "Track orders, save your details and your wishlist. We'll email you a code — no password needed."
                    : "Enter your email and we'll send you a 6-digit code to sign in."}
                </p>

                <form onSubmit={onEmail} noValidate className="mt-6 flex flex-col gap-4">
                  {signup && (
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium">Full name</span>
                      <input
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
            ) : (
              <>
                <h1 className="font-display text-2xl font-semibold tracking-tight">Check your email</h1>
                <p className="mt-1 text-sm leading-relaxed text-ink/55">
                  We sent a {CODE_LENGTH}-digit code to <strong className="font-semibold text-ink">{email.trim()}</strong>. It may take a
                  minute to arrive — check spam too.
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

/* One box per digit. Typing moves to the next box, Backspace goes back,
   and pasting (or the phone's "fill code from email") fills every box. */
function CodeBoxes({
  value,
  onChange,
  disabled,
  firstRef,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  firstRef: RefObject<HTMLInputElement | null>;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[Math.max(0, Math.min(CODE_LENGTH - 1, i))]?.focus();

  // Puts digits in from box `at` (one typed digit, or a whole pasted code).
  function fill(at: number, typed: string) {
    const digits = typed.replace(/\D/g, "");
    if (!digits) return;
    // Changing one box that already has a digit: replace just that digit.
    if (digits.length === 1 && at < value.length) {
      onChange(value.slice(0, at) + digits + value.slice(at + 1));
      focus(at + 1);
      return;
    }
    const start = digits.length >= CODE_LENGTH ? 0 : Math.min(at, value.length); // no gaps
    const next = (value.slice(0, start) + digits).slice(0, CODE_LENGTH);
    onChange(next);
    focus(next.length);
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) onChange(value.slice(0, i) + value.slice(i + 1));
      else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {Array.from({ length: CODE_LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
            if (i === 0) firstRef.current = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          disabled={disabled}
          value={value[i] ?? ""}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            // If the box already had a digit and another was typed after it, keep the new one.
            const v = e.target.value;
            fill(i, value[i] && v.length === 2 && v.startsWith(value[i]) ? v.slice(1) : v);
          }}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e: ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            fill(i, e.clipboardData.getData("text"));
          }}
          className="h-14 w-full min-w-0 rounded-xl border border-ink/15 bg-paper text-center font-mono text-2xl font-semibold text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-60 sm:h-16"
        />
      ))}
    </div>
  );
}
