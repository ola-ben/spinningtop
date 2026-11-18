import type { ReactNode } from "react";
import { AdminIcon, type AdminIconName } from "./AdminIcons";

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
      {actions && <div className="flex items-center gap-2 max-sm:w-full">{actions}</div>}
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
    <section className={`rounded-2xl bg-paper shadow-sm ${className}`}>
      {(title || actions) && (
        <div className={`flex flex-wrap items-center justify-between gap-3 px-5 pt-5 ${flush ? "pb-4" : "pb-0"}`}>
          <div className="min-w-0">
            {title && <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink/55">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={flush ? "" : "p-5"}>{children}</div>
    </section>
  );
}

/** Key number: label + icon on top, big value, change chip, comparison line. */
export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
  change,
  sub,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn";
  icon?: AdminIconName;
  /** Small chip next to the value, e.g. "0%". */
  change?: string;
  /** Muted line under the value, e.g. "Last month: 0". */
  sub?: string;
}) {
  const hintColor = tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-ink/50";
  return (
    <div className="flex flex-col rounded-2xl bg-paper p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink/65">{label}</p>
        {icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/70">
            <AdminIcon name={icon} className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className={`flex flex-wrap items-center gap-2 ${icon ? "mt-1" : "mt-3"}`}>
        <p className="font-display text-[1.75rem] font-semibold leading-none tabular-nums tracking-tight sm:text-[2rem]">{value}</p>
        {change && (
          <span className="rounded-md bg-ink/[0.05] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-ink/55">{change}</span>
        )}
      </div>
      {hint && <p className={`mt-2 text-xs ${hintColor}`}>{hint}</p>}
      {sub && <p className="mt-auto pt-4 text-xs text-ink/50">{sub}</p>}
    </div>
  );
}

const BADGE_TONES = {
  blue: "border-brand/25 bg-brand/[0.07] text-brand",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  grey: "border-ink/10 bg-ink/[0.04] text-ink/60",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({ tone = "grey", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Status → badge colour, shared by orders, courses, team. */
export const STATUS_TONE: Record<string, BadgeTone> = {
  Received: "violet",
  New: "violet",
  Contacted: "blue",
  Quoted: "amber",
  Scheduled: "blue",
  "In progress": "blue",
  Completed: "green",
  "Out for delivery": "amber",
  Open: "blue",
  Processing: "blue",
  "Ready for pickup": "amber",
  Delivered: "green",
  Published: "green",
  Pending: "amber",
  Hidden: "grey",
  Expired: "grey",
  Replied: "amber",
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
  wrap: "overflow-x-auto px-3 pb-3",
  table: "w-full min-w-[640px] border-separate border-spacing-0 text-left text-sm",
  th: "whitespace-nowrap bg-[#f3f4f6] px-4 py-3 text-xs font-medium text-ink/55 first:rounded-l-xl last:rounded-r-xl",
  td: "whitespace-nowrap border-b border-ink/[0.06] px-4 py-3.5 align-middle",
  row: "transition-colors hover:bg-[#f9fafb]",
};

/** Toolbar above a table: search + filters. */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 px-5 py-4">{children}</div>;
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
      <input type="search" placeholder={placeholder} aria-label={placeholder} className={`${inputClass.replace("rounded-xl", "rounded-full")} pl-9`} />
    </div>
  );
}

export function Select({ options, label, defaultValue }: { options: string[]; label: string; defaultValue?: string }) {
  return (
    <select
      aria-label={label}
      defaultValue={defaultValue}
      // Same look as inputs, but sized to its content so filters sit in a row.
      className={`${inputClass.replace("w-full ", "").replace("rounded-xl", "rounded-full")} w-auto cursor-pointer pr-8`}
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
