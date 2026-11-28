"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import ImageSlot from "@/components/ImageSlot";
import { clearCart, useCart } from "@/lib/cart-store";
import { useLiveProducts } from "@/lib/live-catalogue";
import { placeOrder, startPayment } from "@/lib/order-data";
import { formatNaira, type Product } from "@/lib/shop-data";
import { BRANCHES } from "@/lib/site";
import { COURIERS, useDeliveryZones } from "@/lib/delivery";
import { signInWithGoogle, useHydrated, useUser } from "@/lib/user-store";
import { GoogleLogo, MailIcon } from "@/components/account/AuthIcons";
import { cartLines } from "./CartDrawer";
import ShopChrome from "./ShopChrome";
import Busy from "@/components/Busy";

const input =
  "w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/15";

/* /checkout — signed-in customers place an order from their cart, then pay
   online with Paystack (card, bank transfer or USSD).
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
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const outOfStock = lines.filter((l) => !l.product.inStock);

  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup");
  // Delivery: Holt (fixed price per area, set in Admin → Delivery). Kwik is coming soon.
  const { zones, loading: zonesLoading } = useDeliveryZones();
  const [zoneId, setZoneId] = useState("");
  const zone = zones.find((z) => z.id === zoneId && z.active) ?? null;
  const deliveryFee = fulfilment === "delivery" && zone ? zone.price : 0;
  const total = subtotal + deliveryFee;
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [paying, setPaying] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const name = String(d.get("name") ?? "").trim();
    const phone = String(d.get("phone") ?? "").trim();
    const outlet = String(d.get("outlet") ?? "");
    const address = String(d.get("address") ?? "").trim();
    if (!name) return setError("Enter your name.");
    if (phone.replace(/\D/g, "").length < 10) return setError("Enter a phone number we can call or WhatsApp.");
    if (fulfilment === "delivery" && !zone) return setError("Choose your delivery area.");
    if (fulfilment === "delivery" && !address) return setError("Enter the delivery address.");
    if (outOfStock.length) return setError("Remove the out-of-stock items from your cart first.");

    setError("");
    setPending(true);
    const res = await placeOrder({
      items: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
      fulfilment,
      outlet,
      deliveryAddress: address,
      deliveryZoneId: zone?.id ?? null,
      phone,
      name,
      note: String(d.get("note") ?? "").trim(),
    });
    if (res.error || !res.id) {
      setPending(false);
      return setError(res.error ?? "Could not place the order. Please try again.");
    }
    clearCart();
    // Straight on to Paystack. If that fails, the order waits in My Orders with a "Pay now" button.
    setPaying(true);
    const payErr = await startPayment(res.id);
    if (payErr) router.push(`/account/orders/?placed=${encodeURIComponent(res.id)}&payment=failed`);
  }

  let body;
  if (!ready) {
    body = <div className="h-[50vh]" aria-busy="true" />;
  } else if (paying) {
    // The cart is already cleared — keep a calm "on the way" screen until Paystack opens.
    body = (
      <Card>
        <p className="font-display text-lg font-semibold">
          <Busy text="Taking you to Paystack" />
        </p>
        <p className="mt-1 text-sm text-ink/60">Your order is saved. Please don&apos;t close this page.</p>
      </Card>
    );
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
    // Focused sign-in pop-up over the checkout (nothing else to click).
    return <SignInModal />;
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
                      {f === "pickup" ? "Collect from one of our outlets" : "Delivered to your address by our delivery partner"}
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
              <>
                <p className="mb-2 mt-4 text-sm font-medium">Delivery company</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {COURIERS.map((c) =>
                    c.comingSoon ? (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setToast(`${c.name} delivery is coming soon. Please choose ${COURIERS[0].name} for now.`)}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-ink/15 p-4 text-left opacity-70 transition-opacity hover:opacity-100"
                      >
                        <span>
                          <span className="block text-sm font-semibold">{c.name}</span>
                          <span className="block text-xs text-ink/55">Live prices by distance</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-ink/60">Coming soon</span>
                      </button>
                    ) : (
                      <label
                        key={c.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/15 p-4 has-[:checked]:border-brand has-[:checked]:bg-tint"
                      >
                        <input type="radio" name="courier" value={c.id} checked readOnly className="mt-0.5 h-4 w-4 accent-[var(--color-brand)]" />
                        <span>
                          <span className="block text-sm font-semibold">{c.name}</span>
                          <span className="block text-xs text-ink/55">{c.note}</span>
                        </span>
                      </label>
                    ),
                  )}
                </div>

                <Field label="Delivery area" className="mt-4">
                  <select
                    name="zone"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    disabled={zonesLoading}
                    className={`${input} cursor-pointer disabled:cursor-wait`}
                  >
                    <option value="" disabled>
                      {zonesLoading ? "Loading areas" : zones.length ? "Choose your area" : "No delivery areas yet — choose pickup"}
                    </option>
                    {zones
                      .filter((z) => z.active)
                      .map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.area} — {formatNaira(z.price)}
                        </option>
                      ))}
                  </select>
                </Field>
                <p className="mt-1.5 text-xs text-ink/50">Area not listed? Choose pickup, or WhatsApp us and we&rsquo;ll help.</p>
                <Field label="Delivery address" className="mt-4">
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue={user.address}
                    autoComplete="street-address"
                    placeholder="House number, street and nearest landmark"
                    className={`${input} resize-none`}
                  />
                </Field>
              </>
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
          {fulfilment === "delivery" && (
            <div className="mt-4 flex flex-col gap-1.5 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-ink/65">Subtotal</span>
                <span className="tabular-nums">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink/65">Delivery{zone ? ` · Holt · ${zone.area}` : ""}</span>
                <span className="tabular-nums">{zone ? formatNaira(zone.price) : "Choose area"}</span>
              </div>
            </div>
          )}
          <div className="mt-4 flex items-baseline justify-between border-t border-ink/10 pt-4">
            <span className="text-sm text-ink/65">Total</span>
            <span className="font-display text-xl font-bold tabular-nums">{formatNaira(total)}</span>
          </div>

          <div className="mt-4 rounded-xl bg-tint px-3.5 py-3 text-xs leading-relaxed text-ink/70">
            <strong className="font-semibold text-ink">Payment:</strong> you&rsquo;ll pay securely with Paystack (card, bank transfer or USSD) on the next
            step. Unpaid orders are cancelled after 1 hour.
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
            {paying ? <Busy text="Opening secure payment" /> : pending ? <Busy text="Placing order" /> : `Place order & pay · ${formatNaira(total)}`}
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
      {toast && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-2xl bg-ink px-4 py-3 text-center text-sm font-medium text-paper shadow-lg"
        >
          {toast}
        </div>
      )}
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

/** Checkout while signed out: a focused pop-up with just the sign-in choices. */
function SignInModal() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);
  const option =
    "flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-ink/15 bg-paper py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-ink/[0.02] disabled:cursor-wait disabled:opacity-70";
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="checkout-signin">
      <div className="relative w-full max-w-md rounded-2xl bg-paper p-6 shadow-2xl sm:p-8">
        <Link
          href="/shop"
          aria-label="Back to the shop"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-ink/60 transition-colors hover:bg-ink/[0.05] hover:text-ink"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
        <h2 id="checkout-signin" className="pr-8 font-display text-2xl font-semibold tracking-tight">
          Sign in to place your order
        </h2>
        <p className="mt-1 text-sm text-ink/55">Your cart is saved. It only takes a moment.</p>

        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setError("");
            setPending(true);
            const err = await signInWithGoogle("/checkout/");
            if (err) {
              setPending(false);
              setError(err);
            }
          }}
          className={`${option} mt-6`}
        >
          {pending ? (
            <Busy text="Opening Google" />
          ) : (
            <>
              <GoogleLogo />
              Continue with Google
            </>
          )}
        </button>
        <Link href="/login/?next=/checkout/&with=email" className={`${option} mt-3`}>
          <MailIcon />
          Continue with email
        </Link>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
