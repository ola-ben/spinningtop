"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/lib/admin-auth";
import {
  BOOKING_STATUSES,
  bookingPhotoUrls,
  logisticsLabel,
  setBookingNote,
  setBookingStatus,
  useAdminBookings,
  type Booking,
  type BookingStatus,
} from "@/lib/admin-bookings";
import { formatOrderDate } from "@/lib/order-data";
import { Badge, STATUS_TONE, Toolbar, btn, inputClass, table } from "./ui";
import Busy from "@/components/Busy";

/** "0803 123 4567" → "2348031234567" for WhatsApp links. */
const toWhatsApp = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? `234${d.slice(1)}` : d;
};

/* Bookings: status tabs → table → slide-over to contact the customer,
   update status and keep notes. Live from Supabase (supabase/bookings.sql). */
export default function BookingsBoard() {
  const { bookings, loading, error, reload } = useAdminBookings();
  const [status, setStatus] = useState<BookingStatus | "All">("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = bookings.find((b) => b.id === selectedId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => status === "All" || b.status === status)
      .filter((b) => !q || [b.id, b.fullName, b.phone, b.email, b.area, ...b.serviceNames].join(" ").toLowerCase().includes(q));
  }, [bookings, status, query]);
  const count = (s: BookingStatus | "All") => (s === "All" ? bookings.length : bookings.filter((b) => b.status === s).length);

  return (
    <>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="rounded-2xl border border-ink/10 bg-paper">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-ink/10 px-3 pt-2" role="tablist" aria-label="Booking status">
          {(["All", ...BOOKING_STATUSES] as const).map((s) => {
            const active = status === s;
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatus(s)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 pb-3 pt-2 text-sm font-medium transition-colors ${
                  active ? "border-brand text-brand" : "border-transparent text-ink/55 hover:text-ink"
                }`}
              >
                {s}
                <span className={`rounded-full px-1.5 text-[11px] font-bold ${active ? "bg-brand/10" : "bg-ink/[0.06]"}`}>{count(s)}</span>
              </button>
            );
          })}
        </div>

        <Toolbar>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by booking number, customer, phone, area or service"
            aria-label="Search bookings"
            className={`${inputClass.replace("rounded-xl", "rounded-full")} min-w-[12rem] flex-1`}
          />
          <button type="button" onClick={() => void reload()} className={btn.secondary}>
            Refresh
          </button>
        </Toolbar>

        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Booking</th>
                <th className={table.th}>Customer</th>
                <th className={table.th}>Services</th>
                <th className={table.th}>Area</th>
                <th className={table.th}>Pickup / drop-off</th>
                <th className={table.th}>Status</th>
                <th className={table.th}>Sent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} onClick={() => setSelectedId(b.id)} className={`${table.row} cursor-pointer ${b.status === "New" ? "bg-brand/[0.03]" : ""}`}>
                  <td className={`${table.td} font-semibold text-brand`}>
                    {b.id}
                    {b.photos.length > 0 && <span className="ml-1.5 text-xs font-normal text-ink/45">📷 {b.photos.length}</span>}
                  </td>
                  <td className={table.td}>
                    <p className="font-medium">{b.fullName}</p>
                    <p className="text-xs text-ink/50">{b.phone}</p>
                  </td>
                  <td className={`${table.td} max-w-[16rem] text-ink/65`}>
                    <span className="line-clamp-2">{b.serviceNames.join(", ")}</span>
                  </td>
                  <td className={`${table.td} text-ink/65`}>{b.area}</td>
                  <td className={`${table.td} text-ink/65`}>{logisticsLabel(b.logistics, b.outlet)}</td>
                  <td className={table.td}>
                    <Badge tone={STATUS_TONE[b.status] ?? "grey"}>{b.status}</Badge>
                  </td>
                  <td className={`${table.td} text-ink/55`}>{formatOrderDate(b.createdAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-ink/50">
                    {loading
                      ? "Loading bookings…"
                      : query
                        ? "No bookings match your search."
                        : status === "All"
                          ? "No booking requests yet."
                          : `No ${status.toLowerCase()} bookings.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 ${selected ? "" : "pointer-events-none"}`} aria-hidden={!selected}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close booking"
          onClick={() => setSelectedId(null)}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${selected ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          role="dialog"
          aria-label="Booking details"
          className={`absolute inset-y-0 right-0 flex w-[min(30rem,100vw)] flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
            selected ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selected && <BookingDetails key={selected.id} booking={selected} onClose={() => setSelectedId(null)} onSaved={reload} />}
        </aside>
      </div>
    </>
  );
}

function BookingDetails({ booking: b, onClose, onSaved }: { booking: Booking; onClose: () => void; onSaved: () => Promise<void> }) {
  const { can } = useAdminSession();
  const canUpdate = can("orders.update");
  const canCancel = can("orders.cancel");
  const [status, setStatus] = useState<BookingStatus>(b.status);
  const [statusNote, setStatusNote] = useState("");
  const [note, setNote] = useState(b.adminNote);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const changed = status !== b.status || note !== b.adminNote;

  async function save() {
    setBusy(true);
    setMessage(null);
    let err: string | null = null;
    if (status !== b.status) err = await setBookingStatus(b.id, status, statusNote.trim());
    if (!err && note !== b.adminNote) err = await setBookingNote(b.id, note);
    await onSaved();
    setBusy(false);
    setStatusNote("");
    setMessage(err ? { ok: false, text: err } : { ok: true, text: "Saved ✓" });
  }

  const label = "text-xs font-semibold uppercase tracking-wide text-ink/45";

  return (
    <>
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
        <div>
          <p className="font-display text-lg font-semibold">{b.id}</p>
          <p className="text-xs text-ink/55">{formatOrderDate(b.createdAt)} · Website booking</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close booking" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-ink/[0.05]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <section>
          <p className={label}>Customer</p>
          <p className="mt-2 font-medium">{b.fullName}</p>
          <p className="text-sm text-ink/60">{b.phone}</p>
          <p className="text-sm text-ink/60">{b.email}</p>
          <p className="text-sm text-ink/60">{b.area}</p>
        </section>

        <section>
          <p className={label}>Services</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {b.serviceNames.map((s) => (
              <li key={s} className="rounded-full bg-ink/[0.05] px-3 py-1 text-sm font-medium">
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className={label}>Pickup / drop-off</p>
          <p className="mt-2 text-sm">{logisticsLabel(b.logistics, b.outlet)}</p>
          {b.notes && <p className="mt-2 whitespace-pre-line rounded-lg bg-tint px-3 py-2 text-sm text-ink/75">“{b.notes}”</p>}
        </section>

        {b.photos.length > 0 && (
          <section>
            <p className={label}>Photos</p>
            <Photos paths={b.photos} />
          </section>
        )}

        <section>
          <label className={label} htmlFor="booking-status">
            Status
          </label>
          <select
            id="booking-status"
            value={status}
            disabled={!canUpdate}
            onChange={(e) => setStatus(e.target.value as BookingStatus)}
            className={`${inputClass} mt-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s} disabled={s === "Cancelled" && !canCancel && b.status !== "Cancelled"}>
                {s}
              </option>
            ))}
          </select>
          {status !== b.status && (
            <input
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Message for the customer (optional), e.g. Quote ₦15,000, visit Tuesday 10am"
              className={`${inputClass} mt-2`}
            />
          )}
        </section>

        <section>
          <p className={label}>History</p>
          <ol className="mt-2 flex flex-col gap-2 text-sm">
            {b.history.map((h, i) => (
              <li key={`${h.at}-${i}`} className="flex justify-between gap-3">
                <span>
                  <span className="font-medium">{h.status}</span>
                  {h.note && <span className="text-ink/55"> · {h.note}</span>}
                </span>
                <span className="shrink-0 text-xs text-ink/50">{formatOrderDate(h.at)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <label className={label} htmlFor="booking-note">
            Internal note
          </label>
          <textarea
            id="booking-note"
            rows={3}
            value={note}
            disabled={!canUpdate}
            onChange={(e) => setNote(e.target.value)}
            className={`${inputClass} mt-2 disabled:opacity-60`}
            placeholder="Visible to staff only"
          />
        </section>

        {message && (
          <p role="status" className={`rounded-xl px-3.5 py-2.5 text-sm ${message.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-ink/10 px-5 py-4">
        <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className={btn.secondary}>
          Call
        </a>
        <a
          href={`https://wa.me/${toWhatsApp(b.phone)}?text=${encodeURIComponent(`Hello ${b.fullName.split(" ")[0]}, this is Spinning Top about your booking ${b.id}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btn.secondary}
        >
          WhatsApp
        </a>
        {canUpdate && (
          <button type="button" disabled={!changed || busy} onClick={() => void save()} className={`${btn.primary} disabled:cursor-not-allowed disabled:opacity-50`}>
            {busy ? <Busy text="Saving" /> : "Save"}
          </button>
        )}
      </div>
    </>
  );
}

/** Private photos via short-lived links; click one to enlarge. */
function Photos({ paths }: { paths: string[] }) {
  const [urls, setUrls] = useState<string[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    bookingPhotoUrls(paths).then((u) => {
      if (live) setUrls(u);
    });
    return () => {
      live = false;
    };
  }, [paths]);

  if (urls === null) return <p className="mt-2 text-sm text-ink/50">Loading photos…</p>;
  if (urls.length === 0) return <p className="mt-2 text-sm text-ink/50">Photos couldn&rsquo;t be loaded.</p>;

  return (
    <>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {urls.map((u, i) => (
          <button key={u} type="button" onClick={() => setOpen(u)} className="aspect-square cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt={`Customer photo ${i + 1}`} className="h-full w-full object-cover transition-transform hover:scale-105" />
          </button>
        ))}
      </div>
      {open && (
        <button
          type="button"
          onClick={() => setOpen(null)}
          aria-label="Close photo"
          className="fixed inset-0 z-[60] grid cursor-zoom-out place-items-center bg-ink/85 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open} alt="Customer photo, enlarged" className="max-h-full max-w-full rounded-xl object-contain" />
        </button>
      )}
    </>
  );
}
