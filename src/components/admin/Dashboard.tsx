"use client";

import Link from "next/link";
import { ShopBadge, ShopSwitch, useAdminProducts } from "@/components/admin/CatalogueForms";
import { AdminIcon } from "@/components/admin/AdminIcons";
import { Badge, Card, STATUS_TONE, SearchInput, StatCard, btn, table } from "@/components/admin/ui";
import { CUSTOMERS, ORDERS, formatDateTime, orderTotal } from "@/lib/admin-demo";
import { isOpenOrder } from "@/lib/orders";
import { formatNaira, type Product } from "@/lib/shop-data";

/* Dashboard (client component: stock numbers and the shop switch are read
   live from Supabase). The page title is set in src/app/admin/page.tsx. */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** ₦12,500 → "12.5k" for chart axes. */
const compact = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n));

/** Delivered sales per weekday (Mon → Sun) from the orders list. */
function salesByWeekday() {
  const totals = DAYS.map(() => 0);
  for (const o of ORDERS) {
    if (o.status !== "Delivered") continue;
    const day = (new Date(o.createdAt).getDay() + 6) % 7; // Mon = 0
    totals[day] += orderTotal(o);
  }
  return totals;
}

function RevenueChart() {
  const values = salesByWeekday();
  const max = Math.max(...values);
  const best = values.indexOf(max);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => (max ? compact(Math.round(max * f)) : f === 0 ? "0" : ""));

  return (
    <div className="relative">
      <div className="flex h-60 gap-3 sm:h-64">
        {/* Y axis */}
        <div className="flex flex-col justify-between pb-7 text-right text-[11px] tabular-nums text-ink/45">
          {ticks.map((t, i) => (
            <span key={i} className="leading-none">
              {t}
            </span>
          ))}
        </div>
        {/* Bars over dashed grid lines */}
        <div className="relative flex-1">
          <div className="absolute inset-x-0 bottom-7 top-0 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((_, i) => (
              <span key={i} className="border-t border-dashed border-ink/10" />
            ))}
          </div>
          <div className="relative flex h-full items-end justify-around gap-2 sm:gap-4">
            {values.map((v, i) => (
              <div key={DAYS[i]} className="flex h-full w-full max-w-14 flex-col items-center justify-end gap-2">
                <div className="relative flex w-full flex-1 items-end">
                  {/* Faint track so the chart reads even with no sales yet */}
                  <div className="absolute inset-x-0 bottom-0 h-full rounded-full bg-[#f3f4f6]" />
                  {v > 0 && (
                    <div
                      className={`relative w-full rounded-full ${i === best ? "bg-brand" : "bg-brand/70"}`}
                      style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
                      title={`${DAYS[i]}: ${formatNaira(v)}`}
                    />
                  )}
                </div>
                <span className="h-5 text-xs text-ink/55">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {max === 0 && (
        <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-ink/50">
          <span className="rounded-full bg-paper px-3 py-1.5 shadow-sm">No sales yet</span>
        </p>
      )}
    </div>
  );
}

export default function Dashboard({ initialProducts, initialShopOn }: { initialProducts: Product[]; initialShopOn: boolean }) {
  const { products } = useAdminProducts(initialProducts);
  const collected = ORDERS.filter((o) => o.status === "Delivered");
  const revenue = collected.reduce((sum, o) => sum + orderTotal(o), 0);
  const openOrders = ORDERS.filter((o) => isOpenOrder(o.status));
  const outOfStock = products.filter((p) => !p.inStock);
  const inStock = products.length - outOfStock.length;
  const inStockPct = products.length ? Math.round((inStock / products.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Title + period */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.9rem]">Sales overview</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2.5 text-sm font-medium text-ink/75 shadow-sm">
            <AdminIcon name="calendar" className="h-4 w-4" />
            Last 7 days
          </span>
          <Link href="/admin/products/new" className={btn.primary}>
            + Add product
          </Link>
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
        <StatCard label="Total sales" icon="wallet" value={formatNaira(revenue)} change="0%" sub="Last week: ₦0" />
        <StatCard label="Orders" icon="orders" value={String(ORDERS.length)} change="0%" sub={`${openOrders.length} open to confirm`} />
        <StatCard label="Customers" icon="customers" value={String(CUSTOMERS.length)} change="0%" sub={`${CUSTOMERS.filter((c) => c.type === "Business").length} business accounts`} />
        <StatCard label="Products in stock" icon="box" value={`${inStock}/${products.length}`} sub={`${outOfStock.length} out of stock`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        {/* Revenue analytics */}
        <Card
          title="Revenue analytics"
          className="xl:col-span-3"
          actions={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink/70">
              This week
              <AdminIcon name="chevron" className="h-3.5 w-3.5" />
            </span>
          }
        >
          <div className="pt-2">
            <RevenueChart />
          </div>
        </Card>

        {/* Online shop — live switch + stock */}
        <Card title="Online shop" description="Show or hide products on /shop" className="xl:col-span-2">
          <div className="mt-2 flex items-center justify-between gap-4 rounded-xl border border-ink/10 px-4 py-3">
            <div className="min-w-0">
              <ShopBadge initialOn={initialShopOn} />
              <Link href="/shop" target="_blank" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                Open shop <AdminIcon name="external" className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ShopSwitch initialOn={initialShopOn} />
          </div>

          <div className="mt-4 rounded-xl bg-[#f6f7f9] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Stock</p>
              <div className="flex items-center gap-3 text-[11px] text-ink/60">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-brand" /> In stock
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-ink" /> Out
                </span>
              </div>
            </div>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-ink" role="img" aria-label={`${inStockPct}% of products in stock`}>
              <div className="h-full rounded-full bg-brand" style={{ width: `${inStockPct}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink/55">
              {inStock} of {products.length} products in stock
            </p>
            {outOfStock.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2 border-t border-ink/10 pt-3">
                {outOfStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{p.name}</span>
                    <Badge tone="red">Out of stock</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/products" className="mt-3 inline-block text-xs font-semibold text-brand hover:underline">
              Manage products
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card
        title="Recent orders"
        flush
        actions={
          <>
            <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
              <SearchInput placeholder="Search" />
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink/75">
              <AdminIcon name="sort" className="h-4 w-4" />
              Sort by
              <AdminIcon name="chevron" className="h-3.5 w-3.5" />
            </span>
          </>
        }
      >
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={`${table.th} w-10`}>
                  <input type="checkbox" aria-label="Select all orders" className="h-4 w-4 accent-[var(--color-brand)]" />
                </th>
                <th className={table.th}>Order ID</th>
                <th className={table.th}>Date</th>
                <th className={table.th}>Customer</th>
                <th className={table.th}>Channel</th>
                <th className={table.th}>Status</th>
                <th className={table.th}>Items</th>
                <th className={table.th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.slice(0, 6).map((o) => (
                <tr key={o.id} className={table.row}>
                  <td className={table.td}>
                    <input type="checkbox" aria-label={`Select ${o.id}`} className="h-4 w-4 accent-[var(--color-brand)]" />
                  </td>
                  <td className={`${table.td} font-medium`}>#{o.id}</td>
                  <td className={`${table.td} text-ink/60`}>{formatDateTime(o.createdAt)}</td>
                  <td className={table.td}>{o.customer}</td>
                  <td className={`${table.td} text-ink/60`}>{o.channel}</td>
                  <td className={table.td}>
                    <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                  </td>
                  <td className={`${table.td} text-ink/60`}>{o.items.reduce((n, i) => n + i.qty, 0)} items</td>
                  <td className={`${table.td} font-medium tabular-nums`}>{formatNaira(orderTotal(o))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Empty state sits outside the table so it stays centred on phones */}
          {ORDERS.length === 0 && (
            <div className="px-4 py-12 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f3f4f6] text-ink/45">
                <AdminIcon name="orders" className="h-6 w-6" />
              </span>
              <p className="mt-3 text-sm font-medium">No orders yet</p>
              <p className="mt-0.5 text-xs text-ink/50">WhatsApp orders will show here once the backend is connected.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
