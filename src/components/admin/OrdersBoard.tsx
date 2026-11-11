"use client";

import { useState } from "react";
import { ORDERS, ORDER_STATUSES, formatDateTime, orderTotal, type Order, type OrderStatus } from "@/lib/admin-demo";
import { formatNaira } from "@/lib/shop-data";
import { Badge, STATUS_TONE, SearchInput, Select, Toolbar, btn, inputClass, table } from "./ui";

/* Orders: status tabs → table → slide-over with the order details. */
export default function OrdersBoard() {
  const [status, setStatus] = useState<OrderStatus | "All">("All");
  const [selected, setSelected] = useState<Order | null>(null);

  const rows = status === "All" ? ORDERS : ORDERS.filter((o) => o.status === status);
  const count = (s: OrderStatus | "All") => (s === "All" ? ORDERS.length : ORDERS.filter((o) => o.status === s).length);

  return (
    <>
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
          <SearchInput placeholder="Search by order number, customer or phone" />
          <Select label="Outlet" options={["All outlets", "Oluyole, Ibadan", "Dominion University"]} />
          <Select label="Channel" options={["All channels", "WhatsApp", "Walk-in", "Phone"]} />
        </Toolbar>

        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Order</th>
                <th className={table.th}>Customer</th>
                <th className={table.th}>Items</th>
                <th className={table.th}>Total</th>
                <th className={table.th}>Channel</th>
                <th className={table.th}>Status</th>
                <th className={table.th}>Placed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className={`${table.row} cursor-pointer`}
                >
                  <td className={`${table.td} font-semibold text-brand`}>{o.id}</td>
                  <td className={table.td}>
                    <p className="font-medium">{o.customer}</p>
                    <p className="text-xs text-ink/50">{o.phone}</p>
                  </td>
                  <td className={`${table.td} text-ink/65`}>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                  <td className={`${table.td} font-semibold tabular-nums`}>{formatNaira(orderTotal(o))}</td>
                  <td className={`${table.td} text-ink/65`}>{o.channel}</td>
                  <td className={table.td}>
                    <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                  </td>
                  <td className={`${table.td} text-ink/55`}>{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-ink/50">
                    {status === "All" ? "No orders yet." : `No ${status.toLowerCase()} orders.`}
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
          onClick={() => setSelected(null)}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${selected ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          role="dialog"
          aria-label="Order details"
          className={`absolute inset-y-0 right-0 flex w-[min(28rem,100vw)] flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
            selected ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selected && (
            <>
              <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
                <div>
                  <p className="font-display text-lg font-semibold">{selected.id}</p>
                  <p className="text-xs text-ink/55">{formatDateTime(selected.createdAt)} · {selected.channel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close order"
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-ink/[0.05]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Customer</p>
                  <p className="mt-2 font-medium">{selected.customer}</p>
                  <p className="text-sm text-ink/60">{selected.phone}</p>
                  <p className="text-sm text-ink/60">{selected.branch}</p>
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Items</p>
                  <ul className="mt-2 divide-y divide-ink/[0.06] rounded-xl border border-ink/10">
                    {selected.items.map((i) => (
                      <li key={i.name} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                        <span>
                          {i.qty} × {i.name}
                        </span>
                        <span className="font-semibold tabular-nums">{formatNaira(i.qty * i.price)}</span>
                      </li>
                    ))}
                    <li className="flex items-center justify-between px-4 py-3 text-sm font-bold">
                      <span>Total</span>
                      <span className="tabular-nums">{formatNaira(orderTotal(selected))}</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink/45" htmlFor="order-status">
                    Status
                  </label>
                  <select id="order-status" defaultValue={selected.status} className={`${inputClass} mt-2 cursor-pointer`}>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </section>

                <section>
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink/45" htmlFor="order-note">
                    Internal note
                  </label>
                  <textarea id="order-note" rows={3} className={`${inputClass} mt-2`} placeholder="Visible to staff only" />
                </section>
              </div>

              <div className="flex gap-2 border-t border-ink/10 px-5 py-4">
                <a
                  href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btn.secondary} flex-1`}
                >
                  Message customer
                </a>
                <button type="button" className={`${btn.primary} flex-1`}>
                  Save changes
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
