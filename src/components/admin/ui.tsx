import type { ReactNode } from "react";

/* Admin UI kit — plain, server-safe building blocks shared by every tab.
   Inputs are uncontrolled (defaultValue) so screens work as designs now and
   can be wired to forms / server actions when the backend lands. */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className = "",
  flush = false,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** No inner padding (for tables). */
  flush?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-ink/10 bg-paper ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-ink/55">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={flush ? "" : "p-5"}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn";
}) {
  const hintColor = tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-ink/50";
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper p-5">
      <p className="text-xs font-medium text-ink/55">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      {hint && <p className={`mt-1 text-xs ${hintColor}`}>{hint}</p>}
    </div>
  );
}

const BADGE_TONES = {
  blue: "bg-brand/10 text-brand",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  grey: "bg-ink/[0.06] text-ink/60",
  violet: "bg-violet-50 text-violet-700",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({ tone = "grey", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${BADGE_TONES[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** Status → badge colour, shared by orders, courses, team. */
export const STATUS_TONE: Record<string, BadgeTone> = {
  New: "blue",
  Open: "blue",
  Confirmed: "violet",
  Ready: "amber",
  Replied: "amber",
  Collected: "green",
  Active: "green",
  Closed: "grey",
  Cancelled: "red",
  Full: "amber",
  Draft: "grey",
  Invited: "amber",
};

export const btn = {
  primary:
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-deep",
  secondary:
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-ink/15 bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/35",
  ghost:
    "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/[0.06]",
  danger:
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-200 bg-paper px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50",
};

export const inputClass =
  "w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/15";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

/** CSS-only toggle (works without JS). Replace with a controlled switch when wiring. */
export function Toggle({ defaultChecked, label, name }: { defaultChecked?: boolean; label: string; name?: string }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} aria-label={label} className="peer sr-only" />
      <span className="h-6 w-11 rounded-full bg-ink/20 transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30" />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

/** Row with a label/description on the left and a control on the right. */
export function SettingRow({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-ink/55">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* Table styles — tables scroll sideways on small screens. */
export const table = {
  wrap: "overflow-x-auto",
  table: "w-full min-w-[640px] text-left text-sm",
  th: "whitespace-nowrap border-b border-ink/10 bg-ink/[0.02] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink/50",
  td: "whitespace-nowrap border-b border-ink/[0.06] px-5 py-3.5 align-middle",
  row: "transition-colors hover:bg-ink/[0.02]",
};

/** Toolbar above a table: search + filters. */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 px-5 py-3">{children}</div>;
}

export function SearchInput({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative min-w-[12rem] flex-1">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
      </svg>
      <input type="search" placeholder={placeholder} aria-label={placeholder} className={`${inputClass} pl-9`} />
    </div>
  );
}

export function Select({ options, label, defaultValue }: { options: string[]; label: string; defaultValue?: string }) {
  return (
    <select
      aria-label={label}
      defaultValue={defaultValue}
      // Same look as inputs, but sized to its content so filters sit in a row.
      className={`${inputClass.replace("w-full ", "")} w-auto cursor-pointer pr-8`}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

/** Placeholder upload area (file input). */
export function Dropzone({ label, hint }: { label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-ink/[0.02] px-6 py-10 text-center transition-colors hover:border-brand/50 hover:bg-brand/[0.03]">
      <svg className="h-8 w-8 text-ink/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <span className="text-sm font-semibold text-ink">{label}</span>
      {hint && <span className="text-xs text-ink/50">{hint}</span>}
      <input type="file" className="sr-only" />
    </label>
  );
}
