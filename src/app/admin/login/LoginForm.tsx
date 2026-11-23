"use client";

import { useActionState, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/admin/PasswordInput";
import { btn, inputClass } from "@/components/admin/ui";
import { sendAdminCode, setAdminPassword, signInAdmin, verifyAdminCode } from "@/lib/admin-auth";
import Busy from "@/components/Busy";
import CodeBoxes from "@/components/CodeBoxes";
import { CODE_LENGTH } from "@/lib/user-store";

/* Admin sign-in for team members (supabase/admin-access.sql + team-roles.sql).
   "First time or forgot password?" emails a 6-digit code, then the worker
   chooses a password — that's how workers added on Team & roles get in.
   After signing in you return to the admin page you were trying to open. */

function ErrorLine({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {text}
    </p>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "";
  const goIn = () => router.replace(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin/");
  const [setup, setSetup] = useState(false);

  const [error, action, pending] = useActionState<string | null, FormData>(async (_prev, formData) => {
    const err = await signInAdmin(String(formData.get("email") ?? "").trim(), String(formData.get("password") ?? ""));
    if (err) return err;
    goIn();
    return null;
  }, null);

  if (setup) return <SetupAccess onDone={goIn} onBack={() => setSetup(false)} />;

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

      <ErrorLine text={error} />

      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3 disabled:cursor-wait disabled:opacity-70`}>
        {pending ? <Busy text="Signing in" /> : "Sign in"}
      </button>

      <button type="button" onClick={() => setSetup(true)} className="cursor-pointer text-center text-sm font-semibold text-brand hover:underline">
        First time or forgot password?
      </button>
    </form>
  );
}

/** Email → 6-digit code → name + new password. */
function SetupAccess({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState("");
  const [code, setCode] = useState("");
  const checkCode = (value: string) => {
    if (busy) return;
    if (value.length < CODE_LENGTH) return setError(`Enter all ${CODE_LENGTH} digits of the code.`);
    void attempt(
      () => verifyAdminCode(email, value),
      () => setStep("password"),
    );
  };

  async function attempt(fn: () => Promise<string | null>, then: () => void) {
    setBusy(true);
    setError(null);
    const err = await fn();
    setBusy(false);
    if (err) setError(err);
    else then();
  }

  if (step === "email") {
    return (
      <form
        key="email"
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          void attempt(
            () => sendAdminCode(email),
            () => {
              setInfo(`We sent a 6-digit code to ${email}.`);
              setStep("code");
            },
          );
        }}
      >
        <p className="text-sm text-ink/60">Enter the email the owner added for you. We&apos;ll send a 6-digit code to it.</p>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="Your email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            className={inputClass}
          />
        </label>
        <ErrorLine text={error} />
        <button type="submit" disabled={busy} className={`${btn.primary} w-full py-3 disabled:cursor-wait disabled:opacity-70`}>
          {busy ? <Busy text="Sending code" /> : "Send code"}
        </button>
        <button type="button" onClick={onBack} className="cursor-pointer text-center text-sm font-semibold text-brand hover:underline">
          Back to sign in
        </button>
      </form>
    );
  }

  if (step === "code") {
    return (
      <form
        key="code"
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          checkCode(code);
        }}
      >
        {info && <p className="rounded-xl bg-tint px-3.5 py-2.5 text-sm text-ink/75">{info} Check your inbox (and spam).</p>}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">{CODE_LENGTH}-digit code</legend>
          <CodeBoxes
            value={code}
            disabled={busy}
            onChange={(v) => {
              setCode(v);
              // Check automatically once all digits are in.
              if (v.length === CODE_LENGTH) setTimeout(() => checkCode(v), 0);
            }}
          />
        </fieldset>
        <ErrorLine text={error} />
        <button type="submit" disabled={busy} className={`${btn.primary} w-full py-3 disabled:cursor-wait disabled:opacity-70`}>
          {busy ? <Busy text="Checking" /> : "Continue"}
        </button>
        <div className="flex justify-between gap-3 text-sm font-semibold">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void attempt(
                () => sendAdminCode(email),
                () => {
                  setCode("");
                  setInfo(`We sent a new code to ${email}.`);
                },
              )
            }
            className="cursor-pointer text-brand hover:underline"
          >
            Send a new code
          </button>
          <button type="button" onClick={onBack} className="cursor-pointer text-ink/55 hover:text-ink">
            Back to sign in
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      key="password"
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const password = String(data.get("password") ?? "");
        if (password !== String(data.get("confirm") ?? "")) return setError("The two passwords don't match.");
        void attempt(() => setAdminPassword(password, String(data.get("name") ?? "").trim()), onDone);
      }}
    >
      <p className="text-sm text-ink/60">Email confirmed. Choose the password you&apos;ll use to sign in from now on.</p>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Your name</span>
        <input name="name" autoComplete="name" placeholder="Your full name" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">New password</span>
        <PasswordInput name="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Confirm password</span>
        <PasswordInput name="confirm" autoComplete="new-password" minLength={8} placeholder="Type it again" required />
      </label>
      <ErrorLine text={error} />
      <button type="submit" disabled={busy} className={`${btn.primary} w-full py-3 disabled:cursor-wait disabled:opacity-70`}>
        {busy ? <Busy text="Saving" /> : "Save password and continue"}
      </button>
    </form>
  );
}
