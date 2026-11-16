import { Badge, Card, Field, PageHeader, STATUS_TONE, StatCard, btn, inputClass, table } from "@/components/admin/ui";
import { VOUCHERS, formatDate } from "@/lib/admin-demo";
import { formatNaira } from "@/lib/shop-data";

export const metadata = { title: "Vouchers" };

/* Discount codes. Active vouchers appear in customers' My account → Vouchers. */
export default function VouchersPage() {
  const active = VOUCHERS.filter((v) => v.status === "Active");
  const redemptions = VOUCHERS.reduce((n, v) => n + v.used, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Vouchers" description="Discount codes customers can use on orders." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Active vouchers" value={String(active.length)} icon="vouchers" />
        <StatCard label="Drafts" value={String(VOUCHERS.filter((v) => v.status === "Draft").length)} />
        <StatCard label="Expired" value={String(VOUCHERS.filter((v) => v.status === "Expired").length)} />
        <StatCard label="Times used" value={String(redemptions)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="All vouchers" className="xl:col-span-2" flush>
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Code</th>
                  <th className={table.th}>Discount</th>
                  <th className={table.th}>Min. order</th>
                  <th className={table.th}>Expires</th>
                  <th className={table.th}>Used</th>
                  <th className={table.th}>Status</th>
                  <th className={`${table.th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {VOUCHERS.map((v) => (
                  <tr key={v.code} className={table.row}>
                    <td className={table.td}>
                      <code className="rounded border border-dashed border-ink/25 px-2 py-1 text-xs font-semibold">{v.code}</code>
                    </td>
                    <td className={`${table.td} font-medium`}>{v.kind === "Amount" ? `${formatNaira(v.value)} off` : `${v.value}% off`}</td>
                    <td className={`${table.td} text-ink/60`}>{v.minOrder ? formatNaira(v.minOrder) : "None"}</td>
                    <td className={`${table.td} text-ink/60`}>{formatDate(v.expires)}</td>
                    <td className={`${table.td} tabular-nums`}>
                      {v.used}
                      {v.usageLimit !== null && <span className="text-ink/45"> / {v.usageLimit}</span>}
                    </td>
                    <td className={table.td}>
                      <Badge tone={STATUS_TONE[v.status]}>{v.status}</Badge>
                    </td>
                    <td className={`${table.td} text-right`}>
                      <button type="button" className={btn.ghost}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {VOUCHERS.length === 0 && <p className="px-4 py-12 text-center text-sm text-ink/50">No vouchers yet. Create one to get started.</p>}
          </div>
        </Card>

        <Card title="Create voucher" description="Customers enter the code at checkout.">
          <form className="mt-4 flex flex-col gap-4">
            <Field label="Code" hint="Letters and numbers, e.g. WELCOME500.">
              <input name="code" placeholder="WELCOME500" className={`${inputClass} uppercase`} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select name="kind" className={inputClass} defaultValue="Amount">
                  <option value="Amount">₦ off</option>
                  <option value="Percent">% off</option>
                </select>
              </Field>
              <Field label="Value">
                <input name="value" type="number" min={0} placeholder="500" className={inputClass} />
              </Field>
            </div>
            <Field label="Minimum order (₦)" hint="Leave empty for no minimum.">
              <input name="minOrder" type="number" min={0} placeholder="5000" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expires">
                <input name="expires" type="date" className={inputClass} />
              </Field>
              <Field label="Usage limit">
                <input name="usageLimit" type="number" min={1} placeholder="Unlimited" className={inputClass} />
              </Field>
            </div>
            <div className="flex gap-2">
              <button type="button" className={btn.primary}>
                Create voucher
              </button>
              <button type="button" className={btn.secondary}>
                Save draft
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
