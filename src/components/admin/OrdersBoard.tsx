"use client";

import { useMemo, useState } from "react";
import { useAdminOrders } from "@/lib/admin-orders";
import { formatOrderDate, orderCount, setAdminNote, setOrderStatus, setPaymentStatus, type Order } from "@/lib/order-data";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { formatNaira } from "@/lib/shop-data";
import { Badge, STATUS_TONE, Toolbar, btn, inputClass, table } from "./ui";
import Busy from "@/components/Busy";

/** "0803 123 4567" → "2348031234567" for WhatsApp links. */
const toWhatsApp = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? `234${d.slice(1)}` : d;
};

/* Orders: status tabs → table → slide-over to update status, payment and notes.
   Data is live from Supabase (supabase/orders.sql). */
export default function OrdersBoard() {
  const { orders, loading, error, reload } = useAdminOrders();
  const [status, setStatus] = useState<OrderStatus | "All">("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => status === "All" || o.status === status)
      .filter((o) => !q || [o.id, o.customerName, o.phone, o.email].join(" ").toLowerCase().includes(q));
  }, [orders, status, query]);
  const count = (s: OrderStatus | "All") => (s === "All" ? orders.length : orders.filter((o) => o.status === s).length);

  return (
    <>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="rounded-2xl border border-ink/10 bg-paper">
        {/* Status tabs */}
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-ink/10 px-3 pt-2" role="tablist" aria-label="Order status">
          {(["All", ...ORDER_STATUSES] as const).map((s) => {
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
            placeholder="Search by order number, customer, phone or email"
            aria-label="Search orders"
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
                <th className={table.th}>Order</th>
                <th className={table.th}>Customer</th>
                <th className={table.th}>Items</th>
                <th className={table.th}>Total</th>
                <th className={table.th}>Pickup / delivery</th>
                <th className={table.th}>Status</th>
                <th className={table.th}>Placed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} onClick={() => setSelectedId(o.id)} className={`${table.row} cursor-pointer ${o.status === "Received" ? "bg-brand/[0.03]" : ""}`}>
                  <td className={`${table.td} font-semibold text-brand`}>{o.id}</td>
                  <td className={table.td}>
                    <p className="font-medium">{o.customerName || "—"}</p>
                    <p className="text-xs text-ink/50">{o.phone}</p>
                  </td>
                  <td className={`${table.td} text-ink/65`}>{orderCount(o)}</td>
                  <td className={`${table.td} font-semibold tabular-nums`}>
                    {formatNaira(o.subtotal)}
                    {o.paymentStatus === "paid" && <span className="ml-1.5 text-xs font-semibold text-emerald-700">Paid</span>}
                  </td>
                  <td className={`${table.td} text-ink/65`}>{o.fulfilment === "pickup" ? `Pickup · ${o.outlet}` : "Delivery"}</td>
                  <td className={table.td}>
                    <Badge tone={STATUS_TONE[o.status] ?? "grey"}>{o.status}</Badge>
                  </td>
                  <td className={`${table.td} text-ink/55`}>{formatOrderDate(o.createdAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-ink/50">
                    {loading ? "Loading orders…" : query ? "No orders match your search." : status === "All" ? "No orders yet." : `No ${status.toLowerCase()} orders.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order details slide-over */}
      <div className={`fixed inset-0 z-50 ${selected ? "" : "pointer-events-none"}`} aria-hidden={!selected}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close order"
          onClick={() => setSelectedId(null)}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${selected ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          role="dialog"
          aria-label="Order details"
          className={`absolute inset-y-0 right-0 flex w-[min(30rem,100vw)] flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
            selected ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selected && <OrderDetails key={selected.id} order={selected} onClose={() => setSelectedId(null)} onSaved={reload} />}
        </aside>
      </div>
    </>
  );
}

function OrderDetails({ order: o, onClose, onSaved }: { order: Order; onClose: () => void; onSaved: () => Promise<void> }) {
  const [status, setStatus] = useState<OrderStatus>(o.status);
  const [statusNote, setStatusNote] = useState("");
  const [paid, setPaid] = useState(o.paymentStatus === "paid");
  const [note, setNote] = useState(o.adminNote);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const changed = status !== o.status || paid !== (o.paymentStatus === "paid") || note !== o.adminNote;

  async function save() {
    setBusy(true);
    setMessage(null);
    let err: string | null = null;
    if (status !== o.status) err = await setOrderStatus(o.id, status, statusNote.trim());
    if (!err && paid !== (o.paymentStatus === "paid")) err = await setPaymentStatus(o.id, paid ? "paid" : "unpaid");
    if (!err && note !== o.adminNote) err = await setAdminNote(o.id, note);
    await onSaved();
    setBusy(false);
    setStatusNote("");
    setMessage(err ? { ok: false, text: err } : { ok: true, text: "Saved ✓ The customer sees the new status in their account." });
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
        <div>
          <p className="font-display text-lg font-semibold">{o.id}</p>
          <p className="text-xs text-ink/55">
            {formatOrderDate(o.createdAt)} · {o.channel}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close order" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-ink/[0.05]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Customer</p>
          <p className="mt-2 font-medium">{o.customerName || "—"}</p>
          <p className="text-sm text-ink/60">{o.phone}</p>
          <p className="text-sm text-ink/60">{o.email}</p>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{o.fulfilment === "pickup" ? "Pickup" : "Delivery"}</p>
          <p className="mt-2 text-sm">{o.fulfilment === "pickup" ? o.outlet : o.deliveryAddress}</p>
          {o.customerNote && <p className="mt-2 rounded-lg bg-tint px-3 py-2 text-sm text-ink/75">“{o.customerNote}”</p>}
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Items</p>
          <ul className="mt-2 divide-y divide-ink/[0.06] rounded-xl border border-ink/10">
            {o.items.map((i, k) => (
              <li key={`${i.productId}-${k}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>
                  {i.qty} × {i.name}
                  {i.size && <span className="text-ink/50"> ({i.size})</span>}
                </span>
                <span className="font-semibold tabular-nums">{formatNaira(i.qty * i.unitPrice)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between px-4 py-3 text-sm font-bold">
              <span>Total</span>
              <span className="tabular-nums">{formatNaira(o.subtotal)}</span>
            </li>
          </ul>
        </section>

        <section>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/45" htmlFor="order-status">
            Status
          </label>
          <select id="order-status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className={`${inputClass} mt-2 cursor-pointer`}>
            {ORDER_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {status !== o.status && (
            <input
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Message for the customer (optional), e.g. Ready after 2pm"
              className={`${inputClass} mt-2`}
            />
          )}
        </section>

        <section>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-ink/10 px-4 py-3">
            <span>
              <span className="block text-sm font-medium">Payment received</span>
              <span className="block text-xs text-ink/55">Tick when the customer has paid (cash, transfer or POS).</span>
            </span>
            <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="h-5 w-5 accent-[var(--color-brand)]" />
          </label>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">History</p>
          <ol className="mt-2 flex flex-col gap-2 text-sm">
            {o.history.map((h, i) => (
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
          <label className="text-xs font-semibold uppercase tracking-wide text-ink/45" htmlFor="order-note">
            Internal note
          </label>
          <textarea id="order-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={`${inputClass} mt-2`} placeholder="Visible to staff only" />
        </section>

        {message && (
          <p role="status" className={`rounded-xl px-3.5 py-2.5 text-sm ${message.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="flex gap-2 border-t border-ink/10 px-5 py-4">
        <a
          href={`https://wa.me/${toWhatsApp(o.phone)}?text=${encodeURIComponent(`Hello ${o.customerName.split(" ")[0] || ""}, this is Spinning Top about your order ${o.id}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn.secondary} flex-1`}
        >
          WhatsApp customer
        </a>
        <button type="button" disabled={!changed || busy} onClick={() => void save()} className={`${btn.primary} flex-1 disabled:cursor-not-allowed disabled:opacity-50`}>
          {busy ? <Busy text="Saving" /> : "Save changes"}
        </button>
      </div>
    </>
  );
}
