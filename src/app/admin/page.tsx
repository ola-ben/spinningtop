import Link from "next/link";
import { ShopSwitch } from "./AdminForms";
import { Badge, Card, STATUS_TONE, StatCard, btn, table } from "@/components/admin/ui";
import { CUSTOMERS, ORDERS, formatDateTime, orderTotal } from "@/lib/admin-demo";
import { PRODUCTS, formatNaira } from "@/lib/shop-data";
import { getShopSettings, settingsStorageReady } from "@/lib/shop-settings";

// The admin layout's title template only applies to child routes, so set this one in full.
export const metadata = { title: { absolute: "Dashboard · Admin" } };

export default async function DashboardPage() {
  const { showProducts } = await getShopSettings();
  const openOrders = ORDERS.filter((o) => o.status === "New" || o.status === "Confirmed" || o.status === "Ready");
  const revenue = ORDERS.filter((o) => o.status === "Collected").reduce((sum, o) => sum + orderTotal(o), 0);
  const outOfStock = PRODUCTS.filter((p) => !p.inStock);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink/55">Good morning 👋</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem]">Here&rsquo;s your store today</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products/new" className={btn.primary}>
            + Add product
          </Link>
          <Link href="/admin/orders" className={btn.secondary}>
            View orders
          </Link>
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Open orders" value={String(openOrders.length)} hint={`${ORDERS.filter((o) => o.status === "New").length} new to confirm`} tone="warn" />
        <StatCard label="Sales collected (7 days)" value={formatNaira(revenue)}  />
        <StatCard label="Products in stock" value={`${PRODUCTS.length - outOfStock.length}/${PRODUCTS.length}`} hint={`${outOfStock.length} out of stock`} tone={outOfStock.length ? "warn" : "default"} />
        <StatCard label="Customers" value={String(CUSTOMERS.length)} hint={`${CUSTOMERS.filter((c) => c.type === "Business").length} business accounts`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <Card
          title="Recent orders"
          className="lg:col-span-2"
          flush
          actions={
            <Link href="/admin/orders" className={btn.ghost}>
              See all
            </Link>
          }
        >
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Order</th>
                  <th className={table.th}>Customer</th>
                  <th className={table.th}>Total</th>
                  <th className={table.th}>Status</th>
                  <th className={table.th}>Placed</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink/50">
                      No orders yet.
                    </td>
                  </tr>
                )}
                {ORDERS.slice(0, 5).map((o) => (
                  <tr key={o.id} className={table.row}>
                    <td className={`${table.td} font-semibold`}>{o.id}</td>
                    <td className={table.td}>{o.customer}</td>
                    <td className={`${table.td} tabular-nums`}>{formatNaira(orderTotal(o))}</td>
                    <td className={table.td}>
                      <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                    </td>
                    <td className={`${table.td} text-ink/55`}>{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          {/* Store status — live switch */}
          <Card title="Online shop">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Show products on /shop</p>
                <p className="mt-0.5 text-xs text-ink/55">Off shows &ldquo;Coming soon&rdquo;.</p>
              </div>
              <ShopSwitch on={showProducts} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
              <Badge tone={showProducts ? "green" : "grey"}>{showProducts ? "Shop is live" : "Coming soon"}</Badge>
              <Link href="/shop" target="_blank" className={btn.ghost}>
                Open shop ↗
              </Link>
            </div>
            {!settingsStorageReady() && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                Settings can&rsquo;t be saved yet — connect a database.
              </p>
            )}
          </Card>

          {/* Stock alerts */}
          <Card
            title="Stock alerts"
            actions={
              <Link href="/admin/products" className={btn.ghost}>
                Manage
              </Link>
            }
          >
            {outOfStock.length === 0 ? (
              <p className="text-sm text-ink/55">Everything is in stock.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {outOfStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{p.name}</span>
                    <Badge tone="red">Out of stock</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

    </div>
  );
}
