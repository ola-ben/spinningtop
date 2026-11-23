"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ServiceIcon from "@/components/ServiceIcon";
import { getProduct, getService } from "@/lib/admin-catalogue";
import { useAdminSession } from "@/lib/admin-auth";
import type { AdminProduct, AdminService } from "@/lib/catalogue-rows";
import { formatNaira } from "@/lib/shop-data";
import { DeleteButton, ProductForm, ServiceForm, ServiceVisibleSwitch, StockSwitch, useAdminProducts, useAdminServices } from "./CatalogueForms";
import { Badge, Card, PageHeader, SearchInput, Select, SettingRow, Toolbar, btn, table } from "./ui";

/* Admin product & service screens. They run in the browser and load live
   from Supabase (the site is static — no server). Edit screens take the id
   from the address: /admin/products/edit/?id=liquid-detergent-2l */

function LoadError({ error }: { error: string }) {
  return error ? (
    <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {error}
    </p>
  ) : null;
}

const Loading = () => <p className="py-10 text-center text-sm text-ink/50">Loading…</p>;

/* ───────────────────────── products ───────────────────────── */

export function ProductsScreen() {
  const { products, loading, error, reload } = useAdminProducts();
  const { can } = useAdminSession();
  const categories = ["All categories", ...new Set(products.map((p) => p.category))];
  const drafts = products.filter((p) => p.status === "draft").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description={loading ? "Loading…" : `${products.length} products in the catalogue${drafts ? ` · ${drafts} draft` : ""}`}
        actions={
          <>
            <button type="button" className={btn.secondary}>
              Export CSV
            </button>
            {can("products.edit") && (
              <Link href="/admin/products/new/" className={btn.primary}>
                + Add product
              </Link>
            )}
          </>
        }
      />
      <LoadError error={error} />

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
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={6} className={`${table.td} py-10 text-center text-ink/50`}>
                    No products yet. Click “+ Add product” to create one.
                  </td>
                </tr>
              )}
              {products.map((p) => (
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
                    {can("products.edit") ? (
                      <StockSwitch product={p} onDone={reload} />
                    ) : (
                      <span className="text-ink/65">{p.inStock ? "Yes" : "No"}</span>
                    )}
                  </td>
                  <td className={table.td}>
                    {p.status === "draft" ? (
                      <Badge tone="grey">Draft</Badge>
                    ) : (
                      <Badge tone={p.inStock ? "green" : "red"}>{p.inStock ? "Active" : "Out of stock"}</Badge>
                    )}
                  </td>
                  <td className={`${table.td} text-right`}>
                    {can("products.edit") && (
                      <Link href={`/admin/products/edit/?id=${encodeURIComponent(p.id)}`} className={btn.ghost}>
                        Edit
                      </Link>
                    )}
                    {p.status === "published" && (
                      <Link href={`/shop/${p.id}/`} target="_blank" className={btn.ghost}>
                        View ↗
                      </Link>
                    )}
                    {can("products.delete") && <DeleteButton item={p} kind="product" onDone={reload} />}
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

const categoriesOf = (products: AdminProduct[]) => [...new Set(products.map((p) => p.category))].sort();

export function NewProductScreen() {
  const { products } = useAdminProducts();
  return <ProductForm categories={categoriesOf(products)} />;
}

export function EditProductScreen() {
  const id = useSearchParams().get("id") ?? "";
  const { products } = useAdminProducts();
  const [product, setProduct] = useState<AdminProduct | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProduct(id)
      .then((p) => {
        if (active) setProduct(p);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load.");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <LoadError error={error} />;
  if (product === undefined) return <Loading />;
  if (product === null) return <NotFound noun="product" href="/admin/products/" />;
  // key: a fresh form per product.
  return <ProductForm key={product.id} product={product} categories={categoriesOf(products)} />;
}

/* ───────────────────────── services ───────────────────────── */

export function ServicesScreen() {
  const { services, loading, error, reload } = useAdminServices();
  const { can } = useAdminSession();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Services"
        description="Care services shown on the website. Turn off anything not currently offered."
        actions={
          can("services.edit") && (
            <Link href="/admin/services/new/" className={btn.primary}>
              + Add service
            </Link>
          )
        }
      />
      <LoadError error={error} />
      {loading && <Loading />}
      {!loading && services.length === 0 && (
        <p className="text-sm text-ink/55">No services yet. Click “+ Add service” to create one.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => {
          const visible = s.status === "published";
          return (
            <section key={s.id} className="flex flex-col rounded-2xl border border-ink/10 bg-paper p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink/[0.05] text-ink">
                  <ServiceIcon name={s.icon} className="h-5 w-5" />
                </span>
                <Badge tone={visible ? "green" : "grey"}>{visible ? "On website" : "Hidden"}</Badge>
              </div>
              <h2 className="mt-4 font-display text-base font-semibold">{s.name}</h2>
              <p className="mt-1 text-xs text-ink/55">{s.category}</p>

              <div className="mt-4 divide-y divide-ink/10">
                <SettingRow title="Show on website">
                  {can("services.edit") ? (
                    <ServiceVisibleSwitch service={s} onDone={reload} />
                  ) : (
                    <span className="text-sm text-ink/65">{visible ? "Yes" : "No"}</span>
                  )}
                </SettingRow>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-1 pt-4">
                {can("services.edit") && (
                  <Link href={`/admin/services/edit/?id=${encodeURIComponent(s.id)}`} className={btn.ghost}>
                    Edit details →
                  </Link>
                )}
                {visible && (
                  <Link href={`/services/${s.id}/`} target="_blank" className={btn.ghost}>
                    View ↗
                  </Link>
                )}
                {can("services.delete") && <DeleteButton item={s} kind="service" onDone={reload} />}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function EditServiceScreen() {
  const id = useSearchParams().get("id") ?? "";
  const [service, setService] = useState<AdminService | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getService(id)
      .then((s) => {
        if (active) setService(s);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load.");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <LoadError error={error} />;
  if (service === undefined) return <Loading />;
  if (service === null) return <NotFound noun="service" href="/admin/services/" />;
  return <ServiceForm key={service.id} service={service} />;
}

function NotFound({ noun, href }: { noun: string; href: string }) {
  return (
    <div className="py-10 text-center">
      <p className="font-display text-lg font-semibold">This {noun} wasn&rsquo;t found</p>
      <Link href={href} className={`${btn.ghost} mt-3`}>
        ← Back to the list
      </Link>
    </div>
  );
}
