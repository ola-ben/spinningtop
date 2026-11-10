"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { login, setShopVisibility, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="admin-password" className="text-sm font-medium text-ink">
          Password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={visible ? "text" : "password"}
            name="password"
            required
            autoComplete="current-password"
            className="w-full border border-ink/20 bg-paper py-3 pl-4 pr-12 text-base outline-none transition-colors focus:border-brand"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            title={visible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-12 cursor-pointer place-items-center text-ink/50 transition-colors hover:text-brand"
          >
            {visible ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.22A10.48 10.48 0 0 0 1.93 12C3.23 16.34 7.24 19.5 12 19.5c.99 0 1.95-.14 2.86-.39M6.23 6.23A10.45 10.45 0 0 1 12 4.5c4.76 0 8.77 3.16 10.07 7.5a10.52 10.52 0 0 1-4.29 5.77M6.23 6.23 3 3m3.23 3.23 3.65 3.65m7.89 7.89L21 21m-3.23-3.23-3.65-3.65m0 0a3 3 0 1 0-4.24-4.24m4.24 4.24L9.88 9.88" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.04 12.32a1 1 0 0 1 0-.64C3.42 7.51 7.36 4.5 12 4.5c4.64 0 8.57 3.01 9.96 7.18.07.2.07.43 0 .64C20.58 16.49 16.64 19.5 12 19.5c-4.64 0-8.57-3.01-9.96-7.18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-pill disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function SwitchButton({ on }: { on: boolean }) {
  const { pending } = useFormStatus();
  // While saving, show the state it's switching to.
  const shown = pending ? !on : on;

  return (
    <button
      type="submit"
      role="switch"
      aria-checked={on}
      aria-label="Show products on the shop page"
      disabled={pending}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 disabled:cursor-wait ${
        shown ? "bg-brand" : "bg-ink/25"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 rounded-full bg-paper shadow transition-transform duration-200 ${
          shown ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/** On/off switch: each click submits the opposite of the current state. */
export function ShopSwitch({ on }: { on: boolean }) {
  return (
    <form action={setShopVisibility}>
      <input type="hidden" name="showProducts" value={on ? "off" : "on"} />
      <SwitchButton on={on} />
    </form>
  );
}
