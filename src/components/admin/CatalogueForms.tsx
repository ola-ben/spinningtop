"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useOptimistic, useState, useSyncExternalStore, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteProduct,
  deleteService,
  getShopSwitch,
  listProducts,
  listServices,
  saveProduct,
  saveService,
  setProductStock,
  setServiceVisible,
  setShopSwitch,
} from "@/lib/admin-catalogue";
import type { ServiceIconName } from "@/components/ServiceIcon";
import type { AdminProduct, AdminService } from "@/lib/catalogue-rows";
import type { Product } from "@/lib/shop-data";
import { Badge, Card, Field, PageHeader, SettingRow, btn, inputClass } from "./ui";

/* Admin forms, lists and switches for products, services and the shop
   on/off setting. Everything is saved straight to Supabase from the browser
   (src/lib/admin-catalogue.ts); Supabase only accepts it from admin accounts. */

type FormState = { error?: string };

const SERVICE_ICONS: ServiceIconName[] = ["laundry", "cleaning", "tailor", "shoe", "upholstery", "janitorial", "pest"];

function ErrorBox({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {error}
    </p>
  );
}

/** Save draft / Publish — both submit the form; "intent" says which. */
function SaveButtons({ cancelHref, isDraft }: { cancelHref: string; isDraft?: boolean }) {
  const { pending, data } = useFormStatus();
  const intent = data?.get("intent");
  return (
    <>
      <Link href={cancelHref} className={btn.secondary}>
        Cancel
      </Link>
      <button type="submit" name="intent" value="draft" disabled={pending} className={`${btn.secondary} disabled:opacity-60`}>
        {pending && intent === "draft" ? "Saving…" : isDraft ? "Save draft" : "Save as draft (hide)"}
      </button>
      <button type="submit" name="intent" value="publish" disabled={pending} className={`${btn.primary} disabled:opacity-60`}>
        {pending && intent === "publish" ? "Saving…" : "Publish"}
      </button>
    </>
  );
}

/** Checkbox styled as a switch (submitted with the form as "on"). */
function FormToggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} aria-label={label} className="peer sr-only" />
      <span className="h-6 w-11 rounded-full bg-ink/20 transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30" />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

/** Photo upload with preview. Uploads to Supabase Storage when the form is saved. */
function ImagePicker({ current, label, hint }: { current?: string; label: string; hint: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const shown = preview ?? (remove ? null : current);

  return (
    <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-start">
      <div className="relative aspect-square w-40 overflow-hidden rounded-2xl bg-ink/[0.05]">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
          <img src={shown} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-xs text-ink/40">No photo</span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-ink/[0.02] px-6 py-8 text-center transition-colors hover:border-brand/50 hover:bg-brand/[0.03]">
          <span className="text-sm font-semibold text-ink">{preview ? "Choose a different photo" : label}</span>
          <span className="text-xs text-ink/50">{hint}</span>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
              if (file) setRemove(false);
            }}
          />
        </label>
        {current && !preview && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              name="removeImage"
              checked={remove}
              onChange={(e) => setRemove(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            Remove current photo
          </label>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── product form ───────────────────────── */

export function ProductForm({ product, categories }: { product?: AdminProduct; categories: string[] }) {
  const router = useRouter();
  const [state, action] = useActionState<FormState, FormData>(async (_prev, formData) => {
    const error = await saveProduct(formData, product);
    if (error) return { error };
    router.push("/admin/products/");
    return {};
  }, {});
  const editing = !!product;

  return (
    <form action={action} className="flex flex-col gap-6">
      {editing && <input type="hidden" name="existingId" value={product.id} />}
      <PageHeader
        title={editing ? `Edit ${product.name}` : "Add product"}
        description={
          editing
            ? product.status === "draft"
              ? "Draft — hidden from the shop until you publish."
              : `Live at /shop/${product.id}`
            : "Shown on /shop and its own product page."
        }
        actions={<SaveButtons cancelHref="/admin/products" isDraft={!editing || product.status === "draft"} />}
      />
      <ErrorBox error={state.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Basic details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" className="sm:col-span-2">
                <input name="name" required defaultValue={product?.name} className={inputClass} placeholder="e.g. Liquid Laundry Detergent" />
              </Field>
              <Field label="Category" hint="Pick one or type a new category.">
                <input
                  name="category"
                  required
                  list="product-categories"
                  defaultValue={product?.category}
                  className={inputClass}
                  placeholder="Detergents"
                />
                <datalist id="product-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Size / pack" hint="e.g. 2 litres, Pack of 5">
                <input name="size" defaultValue={product?.size} className={inputClass} placeholder="2 litres" />
              </Field>
              <Field label="Short description" className="sm:col-span-2" hint="One line shown on the product page.">
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={product?.description}
                  className={inputClass}
                  placeholder="Everyday liquid detergent for washable fabrics."
                />
              </Field>
              {editing ? (
                <Field label="Web address" className="sm:col-span-2" hint="Fixed once created, so shared links keep working.">
                  <input value={`/shop/${product.id}`} readOnly className={`${inputClass} bg-ink/[0.03] text-ink/60`} />
                </Field>
              ) : (
                <Field label="Web address (optional)" className="sm:col-span-2" hint="Leave empty to make one from the name and size, e.g. liquid-detergent-2-litres.">
                  <input name="slug" className={inputClass} placeholder="liquid-detergent-2l" />
                </Field>
              )}
            </div>
          </Card>

          <Card title="Usage & safety" description="Brand Book p.14 — show instructions and hazard information where relevant.">
            <div className="grid gap-4">
              <Field label="How to use">
                <textarea name="usage" rows={3} defaultValue={product?.usage} className={inputClass} placeholder="Use one cap per normal load…" />
              </Field>
              <Field label="Safety / caution" hint="Leave empty if not needed.">
                <textarea name="caution" rows={2} defaultValue={product?.caution} className={inputClass} placeholder="Keep out of reach of children…" />
              </Field>
            </div>
          </Card>

          <Card title="Photo" description="Well-lit pack shot with a readable label.">
            <div className="grid gap-4">
              <ImagePicker current={product?.image?.src} label="Upload product photo" hint="JPG, PNG or WebP, square, up to 5 MB" />
              <Field label="Photo credit" hint="Optional — photographer's name if it isn't your own photo.">
                <input name="imageCredit" defaultValue={product?.image?.credit} className={inputClass} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Pricing">
            <div className="grid gap-4">
              <Field label="Price (₦)">
                <input name="price" type="number" min={0} step={1} required defaultValue={product?.price} className={inputClass} placeholder="6500" />
              </Field>
              <Field label="Compare-at price (₦)" hint="Optional — the old price, for your records.">
                <input
                  name="compareAtPrice"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={product?.compareAtPrice ?? undefined}
                  className={inputClass}
                  placeholder="7500"
                />
              </Field>
            </div>
          </Card>

          <Card title="Inventory">
            <SettingRow title="In stock" description="Off shows “Out of stock” and greys the product.">
              <FormToggle name="inStock" label="In stock" defaultChecked={product?.inStock ?? true} />
            </SettingRow>
          </Card>
        </div>
      </div>
    </form>
  );
}

/* ───────────────────────── service form ───────────────────────── */

export function ServiceForm({ service }: { service?: AdminService }) {
  const router = useRouter();
  const [state, action] = useActionState<FormState, FormData>(async (_prev, formData) => {
    const error = await saveService(formData, service);
    if (error) return { error };
    router.push("/admin/services/");
    return {};
  }, {});
  const editing = !!service;

  return (
    <form action={action} className="flex flex-col gap-6">
      {editing && <input type="hidden" name="existingId" value={service.id} />}
      <PageHeader
        title={editing ? `Edit ${service.name}` : "Add service"}
        description={
          editing
            ? service.status === "draft"
              ? "Hidden — not shown on /services until you publish."
              : `Live at /services/${service.id}`
            : "Shown on /services and its own service page."
        }
        actions={<SaveButtons cancelHref="/admin/services" isDraft={!editing || service.status === "draft"} />}
      />
      <ErrorBox error={state.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Basic details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Service name" className="sm:col-span-2">
                <input name="name" required defaultValue={service?.name} className={inputClass} placeholder="e.g. Curtain Cleaning" />
              </Field>
              <Field label="Category">
                <select name="category" defaultValue={service?.category ?? "Garment care"} className={`${inputClass} cursor-pointer`}>
                  <option>Garment care</option>
                  <option>Home care</option>
                </select>
              </Field>
              <Field label="Icon" hint="Shown in the admin list.">
                <select name="icon" defaultValue={service?.icon ?? "laundry"} className={`${inputClass} cursor-pointer capitalize`}>
                  {SERVICE_ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Summary" className="sm:col-span-2" hint="One or two lines shown under the name.">
                <textarea
                  name="summary"
                  rows={2}
                  defaultValue={service?.summary}
                  className={inputClass}
                  placeholder="Professional care for curtains and drapes."
                />
              </Field>
              {editing ? (
                <Field label="Web address" className="sm:col-span-2" hint="Fixed once created, so shared links keep working.">
                  <input value={`/services/${service.id}`} readOnly className={`${inputClass} bg-ink/[0.03] text-ink/60`} />
                </Field>
              ) : (
                <Field label="Web address (optional)" className="sm:col-span-2" hint="Leave empty to make one from the name, e.g. curtain-cleaning.">
                  <input name="slug" className={inputClass} placeholder="curtain-cleaning" />
                </Field>
              )}
            </div>
          </Card>

          <Card title="Service details">
            <div className="grid gap-4">
              <Field label="What's included" hint="One item per line.">
                <textarea
                  name="includes"
                  rows={4}
                  defaultValue={service?.includes.join("\n")}
                  className={inputClass}
                  placeholder={"Inspection\nCleaning\nPressing"}
                />
              </Field>
              <Field label="Good to know" hint="Limits or conditions customers should know before booking.">
                <textarea
                  name="note"
                  rows={2}
                  defaultValue={service?.note}
                  className={inputClass}
                  placeholder="We test suitability first and explain any limitations."
                />
              </Field>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Photo">
            <div className="grid gap-4">
              <ImagePicker current={service?.image.src || undefined} label="Upload service photo" hint="JPG, PNG or WebP, up to 5 MB" />
              <Field label="Photo credit" hint="Optional.">
                <input name="imageCredit" defaultValue={service?.image.credit} className={inputClass} />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

/* ───────────────────────── list controls ───────────────────────── */

/** Switch that saves immediately (in stock / visible). Reverts if saving fails. */
function LiveSwitch({ label, checked, onSave }: { label: string; checked: boolean; onSave: (next: boolean) => Promise<void> }) {
  // Shows the new position while saving; falls back to `checked` (the saved value) afterwards.
  const [on, setOn] = useOptimistic(checked);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={pending}
        onClick={() => {
          const next = !on;
          setError("");
          start(async () => {
            setOn(next);
            try {
              await onSave(next);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not save.");
            }
          });
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-wait ${
          on ? "bg-brand" : "bg-ink/20"
        }`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-paper shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
      {error && <span className="max-w-48 whitespace-normal text-xs text-red-600">{error}</span>}
    </span>
  );
}

export function StockSwitch({ product, onDone }: { product: AdminProduct; onDone: () => Promise<void> }) {
  return (
    <LiveSwitch
      label={`${product.name} in stock`}
      checked={product.inStock}
      onSave={async (next) => {
        await setProductStock(product.id, next);
        await onDone();
      }}
    />
  );
}

export function ServiceVisibleSwitch({ service, onDone }: { service: AdminService; onDone: () => Promise<void> }) {
  return (
    <LiveSwitch
      label={`${service.name} shown on website`}
      checked={service.status === "published"}
      onSave={async (next) => {
        await setServiceVisible(service.id, next);
        await onDone();
      }}
    />
  );
}

export function DeleteButton({
  item,
  kind,
  onDone,
}: {
  item: AdminProduct | AdminService;
  kind: "product" | "service";
  onDone: () => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Delete “${item.name}”? This can't be undone. To hide it instead, save it as a draft.`)) return;
        start(async () => {
          try {
            await (kind === "product" ? deleteProduct(item as AdminProduct) : deleteService(item as AdminService));
            await onDone();
          } catch (err) {
            window.alert(err instanceof Error ? err.message : "Could not delete.");
          }
        });
      }}
      className={`${btn.ghost} text-red-600 hover:bg-red-50 disabled:opacity-50`}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

/* ───────────────────────── live admin lists ───────────────────────── */

function useAdminList<T>(load: () => Promise<T[]>, initial?: T[]) {
  const [items, setItems] = useState<T[] | null>(initial ?? null);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    try {
      setItems(await load());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load.");
    }
  }, [load]);
  useEffect(() => {
    // Fetch on open; the list fills in when Supabase answers.
    let active = true;
    load()
      .then((list) => {
        if (active) setItems(list);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load.");
      });
    return () => {
      active = false;
    };
  }, [load]);
  return { items, error, reload };
}

/** All products (drafts too), loaded live. `initial` (build-time list) shows until it arrives. */
export function useAdminProducts(initial?: Product[]) {
  const { items, error, reload } = useAdminList<Product | AdminProduct>(listProducts, initial);
  return { products: (items ?? []) as AdminProduct[], loading: items === null, error, reload };
}

/** All services (hidden too), loaded live. */
export function useAdminServices() {
  const { items, error, reload } = useAdminList<AdminService>(listServices);
  return { services: items ?? [], loading: items === null, error, reload };
}

/* ───────────────────────── shop on/off switch ───────────────────────── */

// Shared by the switch and the badge so both update together.
let shopOn: boolean | null = null;
let shopLoad: Promise<void> | null = null;
const shopListeners = new Set<() => void>();
const setShop = (value: boolean) => {
  shopOn = value;
  shopListeners.forEach((l) => l());
};
const subscribeShop = (cb: () => void) => {
  shopListeners.add(cb);
  return () => {
    shopListeners.delete(cb);
  };
};

function useShopOn(initialOn: boolean) {
  const value = useSyncExternalStore(subscribeShop, () => shopOn, () => null);
  useEffect(() => {
    shopLoad ??= getShopSwitch()
      .then(setShop)
      .catch(() => {
        shopLoad = null;
      });
  }, []);
  return value ?? initialOn;
}

export function ShopBadge({ initialOn }: { initialOn: boolean }) {
  const on = useShopOn(initialOn);
  return <Badge tone={on ? "green" : "grey"}>{on ? "Shop is live" : "Coming soon"}</Badge>;
}

/** Live shop on/off switch — saved to Supabase immediately. */
export function ShopSwitch({ initialOn }: { initialOn: boolean }) {
  const on = useShopOn(initialOn);
  return (
    <LiveSwitch
      label="Show products on the shop page"
      checked={on}
      onSave={async (next) => {
        await setShopSwitch(next);
        setShop(next);
      }}
    />
  );
}
