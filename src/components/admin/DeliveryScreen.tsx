"use client";

import { useState } from "react";
import { deleteZone, saveZone, useDeliveryZones, type DeliveryZone } from "@/lib/delivery";
import { formatNaira } from "@/lib/shop-data";
import Busy from "@/components/Busy";
import { Badge, Card, Field, PageHeader, btn, inputClass, table } from "./ui";

/* /admin/delivery — areas customers can choose at checkout, with the Holt
   delivery fee for each. Changes show on the website straight away. */

type Notice = { ok: boolean; text: string } | null;

export default function DeliveryScreen() {
  const { zones, loading, error, reload } = useDeliveryZones();
  const [notice, setNotice] = useState<Notice>(null);
  const [busyKey, setBusyKey] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function run(key: string, action: () => Promise<string | null>, success: string) {
    setBusyKey(key);
    setNotice(null);
    const err = await action();
    await reload();
    setBusyKey("");
    setNotice(err ? { ok: false, text: err } : { ok: true, text: success });
    return !err;
  }

  const activeCount = zones.filter((z) => z.active).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Delivery" description="Areas customers can choose at checkout and what Holt delivery costs for each." />

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p
          role={notice.ok ? "status" : "alert"}
          className={`rounded-xl px-3.5 py-2.5 text-sm ${notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
        >
          {notice.text}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Holt delivery areas" description={loading ? undefined : `${activeCount} shown at checkout`} className="lg:col-span-2" flush>
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Area</th>
                  <th className={table.th}>Delivery fee</th>
                  <th className={table.th}>At checkout</th>
                  <th className={`${table.th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-ink/50">
                      Loading areas
                    </td>
                  </tr>
                )}
                {!loading && zones.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-ink/50">
                      No areas yet. Add one on the right.
                    </td>
                  </tr>
                )}
                {zones.map((z) =>
                  editingId === z.id ? (
                    <EditRow
                      key={z.id}
                      zone={z}
                      busy={busyKey === `e:${z.id}`}
                      onCancel={() => setEditingId(null)}
                      onSave={async (area, price) => {
                        const ok = await run(`e:${z.id}`, () => saveZone({ id: z.id, area, price }), `${area} updated.`);
                        if (ok) setEditingId(null);
                      }}
                    />
                  ) : (
                    <tr key={z.id} className={table.row}>
                      <td className={`${table.td} font-semibold`}>{z.area}</td>
                      <td className={`${table.td} tabular-nums`}>{formatNaira(z.price)}</td>
                      <td className={table.td}>
                        <button
                          type="button"
                          disabled={busyKey === `t:${z.id}`}
                          onClick={() =>
                            void run(
                              `t:${z.id}`,
                              () => saveZone({ id: z.id, area: z.area, price: z.price, active: !z.active }),
                              z.active ? `${z.area} hidden from checkout.` : `${z.area} shown at checkout.`,
                            )
                          }
                          className="cursor-pointer disabled:opacity-60"
                          title={z.active ? "Click to hide from checkout" : "Click to show at checkout"}
                        >
                          {busyKey === `t:${z.id}` ? (
                            <Busy text="Saving" />
                          ) : (
                            <Badge tone={z.active ? "green" : "grey"}>{z.active ? "Shown" : "Hidden"}</Badge>
                          )}
                        </button>
                      </td>
                      <td className={`${table.td} text-right`}>
                        <button type="button" onClick={() => setEditingId(z.id)} className={btn.ghost}>
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busyKey === `d:${z.id}`}
                          onClick={() => {
                            if (!confirm(`Delete ${z.area}? Customers won't be able to choose it any more.`)) return;
                            void run(`d:${z.id}`, () => deleteZone(z.id), `${z.area} deleted.`);
                          }}
                          className={`${btn.ghost} text-red-600 hover:bg-red-50 disabled:opacity-60`}
                        >
                          {busyKey === `d:${z.id}` ? <Busy text="Deleting" /> : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card title="Add area">
            <form
              className="grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                const area = String(data.get("area") ?? "").trim();
                const price = Number(data.get("price"));
                const sortOrder = Math.max(0, ...zones.map((z) => z.sortOrder)) + 1;
                const ok = await run("add", () => saveZone({ area, price, sortOrder }), `${area} added. Customers can choose it at checkout now.`);
                if (ok) form.reset();
              }}
            >
              <Field label="Area">
                <input name="area" required minLength={2} maxLength={80} placeholder="e.g. Agodi GRA" className={inputClass} />
              </Field>
              <Field label="Delivery fee (₦)">
                <input name="price" type="number" required min={0} step={50} inputMode="numeric" placeholder="500" className={inputClass} />
              </Field>
              <button type="submit" disabled={busyKey === "add"} className={`${btn.primary} disabled:opacity-60`}>
                {busyKey === "add" ? <Busy text="Adding" /> : "Add area"}
              </button>
            </form>
          </Card>

          <Card title="Delivery companies">
            <ul className="flex flex-col divide-y divide-ink/[0.06]">
              <li className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <div>
                  <p className="text-sm font-semibold">Holt</p>
                  <p className="text-xs text-ink/55">Fixed price per area (this list)</p>
                </div>
                <Badge tone="green">Live</Badge>
              </li>
              <li className="flex items-center justify-between gap-3 py-3 last:pb-0">
                <div>
                  <p className="text-sm font-semibold">Kwik</p>
                  <p className="text-xs text-ink/55">Live prices once their API is connected</p>
                </div>
                <Badge tone="amber">Coming soon</Badge>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EditRow({
  zone,
  busy,
  onCancel,
  onSave,
}: {
  zone: DeliveryZone;
  busy: boolean;
  onCancel: () => void;
  onSave: (area: string, price: number) => Promise<void>;
}) {
  const [area, setArea] = useState(zone.area);
  const [price, setPrice] = useState(String(zone.price));
  return (
    <tr className="bg-tint/40">
      <td className={table.td}>
        <input value={area} onChange={(e) => setArea(e.target.value)} aria-label="Area" className={`${inputClass} py-1.5`} />
      </td>
      <td className={table.td}>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          min={0}
          step={50}
          aria-label="Delivery fee"
          className={`${inputClass} w-28 py-1.5`}
        />
      </td>
      <td className={table.td} />
      <td className={`${table.td} text-right`}>
        <button type="button" onClick={onCancel} className={btn.ghost}>
          Cancel
        </button>
        <button type="button" disabled={busy} onClick={() => void onSave(area, Number(price))} className={`${btn.ghost} disabled:opacity-60`}>
          {busy ? <Busy text="Saving" /> : "Save"}
        </button>
      </td>
    </tr>
  );
}
