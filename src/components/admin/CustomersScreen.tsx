"use client";

import { useEffect, useMemo, useState } from "react";
import { markCustomersSeen, readSeen, useAdminCustomers, type AdminCustomer } from "@/lib/admin-customers";
import { Badge, Card, PageHeader, StatCard, Toolbar, btn, inputClass, table } from "./ui";
import Busy from "@/components/Busy";

/* /admin/customers — everyone who created an account on the website,
   newest first. New sign-ups since your last visit are marked "New". */

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const initials = (c: AdminCustomer) =>
  (c.name || c.email)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

/** "0803 123 4567" → "2348031234567" for WhatsApp links. */
const toWhatsApp = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? `234${d.slice(1)}` : d;
};

export default function CustomersScreen() {
  const { customers, loading, error, reload, joinedThisWeek: thisWeek } = useAdminCustomers();
  const [query, setQuery] = useState("");
  // Who counts as "new" is fixed when the page opens, so the labels stay put while you look.
  const [newSince] = useState(() => readSeen());
  const [refreshing, setRefreshing] = useState(false);

  // Opening this page marks everyone as seen (clears the sidebar badge).
  useEffect(() => {
    if (!loading) markCustomersSeen();
  }, [loading, customers.length]);

  const isNew = (c: AdminCustomer) => !newSince || Date.parse(c.joined) > Date.parse(newSince);
  const withPhone = customers.filter((c) => c.phone.trim()).length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => [c.name, c.email, c.phone, c.address].join(" ").toLowerCase().includes(q));
  }, [customers, query]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Everyone with a website account, newest first."
        actions={
          <button
            type="button"
            disabled={refreshing}
            onClick={async () => {
              setRefreshing(true);
              await reload();
              setRefreshing(false);
            }}
            className={`${btn.secondary} disabled:opacity-60`}
          >
            {refreshing ? <Busy text="Refreshing" /> : "Refresh"}
          </button>
        }
      />

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
        <StatCard label="Total customers" icon="customers" value={loading ? "…" : String(customers.length)} />
        <StatCard label="New this week" value={loading ? "…" : String(thisWeek)} tone={thisWeek ? "good" : "default"} />
        <StatCard label="Added a phone number" value={loading ? "…" : String(withPhone)} />
      </div>

      <Card flush>
        <Toolbar>
          <div className="relative min-w-[12rem] flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone or address"
              aria-label="Search customers"
              className={`${inputClass.replace("rounded-xl", "rounded-full")} pl-4`}
            />
          </div>
        </Toolbar>
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Customer</th>
                <th className={table.th}>Phone</th>
                <th className={table.th}>Delivery address</th>
                <th className={table.th}>Joined</th>
                <th className={table.th}>Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-ink/50">
                    Loading customers…
                  </td>
                </tr>
              )}
              {!loading && shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-ink/50">
                    {query ? "No customers match your search." : "No customers yet. New website sign-ups will appear here."}
                  </td>
                </tr>
              )}
              {shown.map((c) => (
                <tr key={c.id} className={`${table.row} ${isNew(c) ? "bg-brand/[0.03]" : ""}`}>
                  <td className={table.td}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tint text-xs font-bold text-brand">
                        {initials(c)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-semibold">
                          {c.name || <span className="text-ink/45">No name</span>}
                          {isNew(c) && <Badge tone="blue">New</Badge>}
                        </p>
                        <a href={`mailto:${c.email}`} className="text-xs text-ink/50 hover:text-brand">
                          {c.email}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className={table.td}>
                    {c.phone ? (
                      <a
                        href={`https://wa.me/${toWhatsApp(c.phone)}?text=${encodeURIComponent(`Hello ${c.name.split(" ")[0] || ""}, this is Spinning Top.`)}`}
                        title="Message on WhatsApp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        {c.phone}
                      </a>
                    ) : (
                      <span className="text-ink/40">—</span>
                    )}
                  </td>
                  <td className={`${table.td} max-w-[16rem] truncate text-ink/65`} title={c.address}>
                    {c.address || <span className="text-ink/40">—</span>}
                  </td>
                  <td className={`${table.td} tabular-nums`}>{formatDate(c.joined)}</td>
                  <td className={`${table.td} tabular-nums text-ink/60`}>{formatDate(c.lastSignIn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
