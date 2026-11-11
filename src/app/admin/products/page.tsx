import Image from "next/image";
import Link from "next/link";
import { Badge, Card, PageHeader, SearchInput, Select, Toggle, Toolbar, btn, table } from "@/components/admin/ui";
import { PRODUCTS, formatNaira } from "@/lib/shop-data";

export const metadata = { title: "Products" };

export default function ProductsPage() {
  const categories = ["All categories", ...new Set(PRODUCTS.map((p) => p.category))];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description={`${PRODUCTS.length} products in the catalogue`}
        actions={
          <>
            <button type="button" className={btn.secondary}>
              Export CSV
            </button>
            <Link href="/admin/products/new" className={btn.primary}>
              + Add product
            </Link>
          </>
        }
      />

      <Card flush>
        <Toolbar>
          <SearchInput placeholder="Search products" />
          <Select label="Category" options={categories} />
          <Select label="Stock" options={["All stock", "In stock", "Out of stock"]} />
        </Toolbar>
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Product</th>
                <th className={table.th}>Category</th>
                <th className={table.th}>Price</th>
                <th className={table.th}>In stock</th>
                <th className={table.th}>Status</th>
                <th className={`${table.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => (
                <tr key={p.id} className={table.row}>
                  <td className={table.td}>
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink/[0.05]">
                        {p.image && <Image src={p.image.src} alt="" fill sizes="44px" className="object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-ink/50">{p.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${table.td} text-ink/65`}>{p.category}</td>
                  <td className={`${table.td} font-semibold tabular-nums`}>{formatNaira(p.price)}</td>
                  <td className={table.td}>
                    <Toggle label={`${p.name} in stock`} defaultChecked={p.inStock} />
                  </td>
                  <td className={table.td}>
                    <Badge tone={p.inStock ? "green" : "red"}>{p.inStock ? "Active" : "Out of stock"}</Badge>
                  </td>
                  <td className={`${table.td} text-right`}>
                    <Link href="/admin/products/new" className={btn.ghost}>
                      Edit
                    </Link>
                    <Link href={`/shop/${p.id}`} target="_blank" className={btn.ghost}>
                      View ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
