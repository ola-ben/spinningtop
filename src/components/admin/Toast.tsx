"use client";

import { useEffect, useSyncExternalStore } from "react";

/* Admin toast: a short message at the top centre of the screen after an
   action (saved, deleted, failed…). Call toast("Saved") from anywhere in the
   admin; <AdminToaster /> (in AdminShell) shows it. */

type Toast = { id: number; text: string; ok: boolean };

let current: Toast | null = null;
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/** Shows a toast. ok=false for errors (red). */
export function toast(text: string, ok = true) {
  current = { id: nextId++, text, ok };
  emit();
}

function dismiss(id: number) {
  if (current?.id !== id) return;
  current = null;
  emit();
}

export function AdminToaster() {
  const t = useSyncExternalStore(subscribe, () => current, () => null);

  // Success hides after 3.5s; errors stay a little longer so they can be read.
  useEffect(() => {
    if (!t) return;
    const timer = setTimeout(() => dismiss(t.id), t.ok ? 3500 : 6000);
    return () => clearTimeout(timer);
  }, [t]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[300] flex justify-center px-4">
      {t && (
        <div
          key={t.id}
          role={t.ok ? "status" : "alert"}
          className={`pointer-events-auto flex max-w-md animate-[toast-in_.25s_ease-out] items-center gap-3 rounded-full py-2.5 pl-3 pr-4 text-sm font-medium shadow-xl ${
            t.ok ? "bg-ink text-paper" : "bg-red-600 text-white"
          }`}
        >
          <span
            aria-hidden="true"
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${t.ok ? "bg-emerald-500 text-white" : "bg-white/20"}`}
          >
            {t.ok ? "✓" : "!"}
          </span>
          <span>{t.text}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className="-mr-1 ml-1 grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
