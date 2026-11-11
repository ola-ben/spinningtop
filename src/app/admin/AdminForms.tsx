"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setShopVisibility, type SwitchState } from "./actions";

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
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 disabled:cursor-wait ${
        shown ? "bg-brand" : "bg-ink/25"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-paper shadow transition-transform duration-200 ${
          shown ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/** Live shop on/off switch: each click submits the opposite of the current state. */
export function ShopSwitch({ on }: { on: boolean }) {
  const [state, action] = useActionState<SwitchState, FormData>(setShopVisibility, {});
  return (
    <form action={action} className="flex flex-col items-end gap-2">
      <input type="hidden" name="showProducts" value={on ? "off" : "on"} />
      <SwitchButton on={on} />
      {state.error && (
        <p role="alert" className="max-w-56 text-right text-xs text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
