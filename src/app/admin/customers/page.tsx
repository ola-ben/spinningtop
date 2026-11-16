import { Badge, Card, PageHeader, SearchInput, Select, StatCard, Toolbar, btn, table } from "@/components/admin/ui";
import { CUSTOMERS } from "@/lib/admin-demo";
import { formatNaira } from "@/lib/shop-data";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  const business = CUSTOMERS.filter((c) => c.type === "Business").length;
  const spent = CUSTOMERS.reduce((sum, c) => sum + c.spent, 0);
  const registered = CUSTOMERS.filter((c) => c.account).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Website accounts and guests who ordered on WhatsApp or in store."
        actions={
          <>
            <button type="button" className={btn.secondary}>
              Export
            </button>
            <button type="button" className={btn.primary}>
              + Add customer
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Total customers" value={String(CUSTOMERS.length)} />
        <StatCard label="Website accounts" value={String(registered)} />
        <StatCard label="Business customers" value={String(business)} />
        <StatCard label="Lifetime sales" value={formatNaira(spent)} />
      </div>

      <Card flush>
        <Toolbar>
          <SearchInput placeholder="Search name, phone or email" />
          <Select label="Type" options={["All types", "Individual", "Business"]} />
          <Select label="Account" options={["All customers", "Website account", "Guest"]} />
        </Toolbar>
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Customer</th>
                <th className={table.th}>Type</th>
                <th className={table.th}>Account</th>
                <th className={table.th}>Orders</th>
                <th className={table.th}>Total spent</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-ink/50">
                    No customers yet.
                  </td>
                </tr>
              )}
              {CUSTOMERS.map((c) => (
                <tr key={c.id} className={table.row}>
                  <td className={table.td}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tint text-xs font-bold text-brand">
                        {c.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        {/* Phone always shown — staff message customers from WhatsApp directly */}
                        <p className="text-xs text-ink/50">
                          {c.phone}
                          {c.email && <> · {c.email}</>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={table.td}>
                    <Badge tone={c.type === "Business" ? "violet" : "grey"}>{c.type}</Badge>
                  </td>
                  <td className={table.td}>
                    <Badge tone={c.account ? "blue" : "grey"}>{c.account ? "Website account" : "Guest"}</Badge>
                  </td>
                  <td className={`${table.td} tabular-nums`}>{c.orders}</td>
                  <td className={`${table.td} font-semibold tabular-nums`}>{formatNaira(c.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
