"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import ImageSlot from "@/components/ImageSlot";
import { clearCart, useCart } from "@/lib/cart-store";
import { useLiveProducts } from "@/lib/live-catalogue";
import { placeOrder } from "@/lib/order-data";
import { formatNaira, type Product } from "@/lib/shop-data";
import { BRANCHES } from "@/lib/site";
import { useHydrated, useUser } from "@/lib/user-store";
import { cartLines } from "./CartDrawer";
import ShopChrome from "./ShopChrome";
import Busy from "@/components/Busy";

const input =
  "w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/15";

/* /checkout — signed-in customers place an order from their cart.
   Payment: online only (Paystack comes later).
   The order is created by Supabase (supabase/orders.sql), which takes prices
   and stock from the products table. */
export default function CheckoutView({ products: initial }: { products: Product[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { products } = useLiveProducts(initial);
  const cart = useCart();
  const user = useUser();
  const ready = useHydrated();
  const lines = cartLines(cart, products);
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const outOfStock = lines.filter((l) => !l.product.inStock);

  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const name = String(d.get("name") ?? "").trim();
    const phone = String(d.get("phone") ?? "").trim();
    const outlet = String(d.get("outlet") ?? "");
    const address = String(d.get("address") ?? "").trim();
    if (!name) return setError("Enter your name.");
    if (phone.replace(/\D/g, "").length < 10) return setError("Enter a phone number we can call or WhatsApp.");
    if (fulfilment === "delivery" && !address) return setError("Enter the delivery address.");
    if (outOfStock.length) return setError("Remove the out-of-stock items from your cart first.");

    setError("");
    setPending(true);
    const res = await placeOrder({
      items: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
      fulfilment,
      outlet,
      deliveryAddress: address,
      phone,
      name,
      note: String(d.get("note") ?? "").trim(),
    });
    setPending(false);
    if (res.error || !res.id) return setError(res.error ?? "Could not place the order. Please try again.");
    clearCart();
    router.push(`/account/orders/?placed=${encodeURIComponent(res.id)}`);
  }

  let body;
  if (!ready) {
    body = <div className="h-[50vh]" aria-busy="true" />;
  } else if (lines.length === 0) {
    body = (
      <Card>
        <p className="font-display text-lg font-semibold">Your cart is empty</p>
        <p className="mt-1 text-sm text-ink/60">Add products to your cart, then come back to check out.</p>
        <Link href="/shop" className="mt-5 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-paper hover:bg-brand-deep">
          Go to the shop
        </Link>
      </Card>
    );
  } else if (!user) {
    body = (
      <Card>
        <p className="font-display text-lg font-semibold">Sign in to place your order</p>
        <p className="mt-1 text-sm text-ink/60">
          We&rsquo;ll email you a 6-digit code — no password needed. Your cart stays saved.
        </p>
        <Link
          href="/login/?next=/checkout/"
          className="mt-5 inline-flex w-full justify-center rounded-full bg-brand py-3.5 text-sm font-bold text-paper hover:bg-brand-deep"
        >
          Sign in or create an account
        </Link>
      </Card>
    );
  } else {
    body = (
      <form onSubmit={onSubmit} noValidate className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="flex flex-col gap-4">
          <Section title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input name="name" defaultValue={user.name} autoComplete="name" className={input} />
              </Field>
              <Field label="Phone (call / WhatsApp)">
                <input name="phone" type="tel" defaultValue={user.phone} autoComplete="tel" placeholder="0803 123 4567" className={input} />
              </Field>
            </div>
            <p className="mt-3 text-xs text-ink/50">Order updates go to {user.email}.</p>
          </Section>

          <Section title="How do you want to get it?">
            <div className="grid gap-3 sm:grid-cols-2">
              {(["pickup", "delivery"] as const).map((f) => (
                <label
                  key={f}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/15 p-4 has-[:checked]:border-brand has-[:checked]:bg-tint"
                >
                  <input
                    type="radio"
                    name="fulfilment"
                    value={f}
                    checked={fulfilment === f}
                    onChange={() => setFulfilment(f)}
                    className="mt-0.5 h-4 w-4 accent-[var(--color-brand)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{f === "pickup" ? "Pick up" : "Delivery"}</span>
                    <span className="block text-xs text-ink/55">
                      {f === "pickup" ? "Collect from one of our outlets" : "Delivered to your address — fee confirmed by our team"}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {fulfilment === "pickup" ? (
              <Field label="Pickup outlet" className="mt-4">
                <select name="outlet" defaultValue={BRANCHES[0].name} className={`${input} cursor-pointer`}>
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field label="Delivery address" className="mt-4">
                <textarea
                  name="address"
                  rows={3}
                  defaultValue={user.address}
                  autoComplete="street-address"
                  placeholder="House number, street, area, city"
                  className={`${input} resize-none`}
                />
              </Field>
            )}
          </Section>

          <Section title="Note (optional)">
            <textarea name="note" rows={2} placeholder="Anything we should know?" className={`${input} resize-none`} />
          </Section>
        </div>

        {/* Summary */}
        <div className="rounded-2xl bg-paper p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {lines.map(({ product: p, qty }) => (
              <li key={p.id} className="flex items-center gap-3">
                <ImageSlot image={{ src: p.image?.src ?? null, alt: p.name, shot: p.name }} aspect="aspect-square" sizes="48px" className="!w-12 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-ink/50">
                    {qty} × {formatNaira(p.price)}
                    {!p.inStock && <span className="ml-1.5 font-semibold text-red-600">Out of stock</span>}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatNaira(p.price * qty)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-ink/10 pt-4">
            <span className="text-sm text-ink/65">Total</span>
            <span className="font-display text-xl font-bold tabular-nums">{formatNaira(total)}</span>
          </div>
          {fulfilment === "delivery" && <p className="mt-1 text-xs text-ink/50">Delivery fee (if any) is confirmed before we send it out.</p>}

          <div className="mt-4 rounded-xl bg-tint px-3.5 py-3 text-xs leading-relaxed text-ink/70">
            <strong className="font-semibold text-ink">Payment:</strong> online. Secure online payment is coming soon; we will contact you to complete payment.
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || outOfStock.length > 0}
            className="mt-4 w-full cursor-pointer rounded-full bg-brand py-3.5 text-sm font-bold text-paper shadow-md shadow-brand/15 transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? <Busy text="Placing order" /> : `Place order · ${formatNaira(total)}`}
          </button>
          <Link href="/shop" className="mt-3 block text-center text-xs font-semibold text-ink/50 hover:text-brand">
            ← Keep shopping
          </Link>
        </div>
      </form>
    );
  }

  return (
    <ShopChrome products={products} query={query} onQuery={setQuery} navigate>
      <main className="min-h-[70vh] bg-ink/[0.04]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <h1 className="mb-5 font-display text-2xl font-semibold tracking-tight">Checkout</h1>
          {body}
        </div>
      </main>
    </ShopChrome>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md rounded-2xl bg-paper p-6 text-center shadow-sm sm:p-8">{children}</div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-paper p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
