import Link from "next/link";
import { Card, Dropzone, Field, PageHeader, SettingRow, Toggle, btn, inputClass } from "@/components/admin/ui";
import { PRODUCTS } from "@/lib/shop-data";

export const metadata = { title: "Add product" };

/* Add / edit product form. Same screen will serve "edit" once the backend
   passes an existing product in (e.g. /admin/products/[id]). */
export default function NewProductPage() {
  const categories = [...new Set(PRODUCTS.map((p) => p.category))];

  return (
    <form className="flex flex-col gap-6">
      <PageHeader
        title="Add product"
        description="Shown on /shop and its own product page."
        actions={
          <>
            <Link href="/admin/products" className={btn.secondary}>
              Cancel
            </Link>
            <button type="button" className={btn.secondary}>
              Save draft
            </button>
            <button type="button" className={btn.primary}>
              Publish product
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Basic details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" className="sm:col-span-2">
                <input className={inputClass} placeholder="e.g. Liquid Laundry Detergent" />
              </Field>
              <Field label="Category">
                <select className={`${inputClass} cursor-pointer`}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                  <option>+ New category…</option>
                </select>
              </Field>
              <Field label="Size / pack" hint="e.g. 2 litres, Pack of 5">
                <input className={inputClass} placeholder="2 litres" />
              </Field>
              <Field label="Short description" className="sm:col-span-2" hint="One line shown on the product page.">
                <textarea rows={2} className={inputClass} placeholder="Everyday liquid detergent for washable fabrics." />
              </Field>
            </div>
          </Card>

          <Card title="Usage & safety" description="Brand Book p.14 — show instructions and hazard information where relevant.">
            <div className="grid gap-4">
              <Field label="How to use">
                <textarea rows={3} className={inputClass} placeholder="Use one cap per normal load…" />
              </Field>
              <Field label="Safety / caution" hint="Leave empty if not needed.">
                <textarea rows={2} className={inputClass} placeholder="Keep out of reach of children…" />
              </Field>
            </div>
          </Card>

          <Card title="Photos" description="Well-lit pack shots with readable labels. First photo is the main image.">
            <Dropzone label="Upload product photos" hint="JPG or PNG, square, at least 1000 × 1000px" />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Pricing">
            <div className="grid gap-4">
              <Field label="Price (₦)">
                <input type="number" min={0} className={inputClass} placeholder="6500" />
              </Field>
              <Field label="Compare-at price (₦)" hint="Optional — shows as a discount.">
                <input type="number" min={0} className={inputClass} placeholder="7500" />
              </Field>
            </div>
          </Card>

          <Card title="Inventory">
            <div className="grid gap-4">
              <Field label="SKU">
                <input className={inputClass} placeholder="ST-DET-2L" />
              </Field>
              <Field label="Quantity in stock">
                <input type="number" min={0} className={inputClass} placeholder="24" />
              </Field>
              <div className="divide-y divide-ink/10">
                <SettingRow title="In stock" description="Off shows “Out of stock” and greys the product.">
                  <Toggle label="In stock" defaultChecked />
                </SettingRow>
                <SettingRow title="Visible in shop" description="Hide without deleting.">
                  <Toggle label="Visible in shop" defaultChecked />
                </SettingRow>
                <SettingRow title="Featured on homepage">
                  <Toggle label="Featured on homepage" />
                </SettingRow>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
