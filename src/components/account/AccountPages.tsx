"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import PasswordInput from "@/components/admin/PasswordInput";
import AddToCart from "@/components/shop/AddToCart";
import { DEMO_MESSAGES, DEMO_ORDERS, DEMO_VOUCHERS, STORE_CREDIT, type DemoOrder, type OrderStatus } from "@/lib/account-demo";
import { useRecentlyViewed, clearViewed } from "@/lib/recent-store";
import { PRODUCTS, formatNaira, type Product } from "@/lib/shop-data";
import { signOut, updateUser, useUser, type User } from "@/lib/user-store";
import { toggleWishlist, useWishlist } from "@/lib/wishlist-store";
import { AccountPanel } from "./AccountShell";
import { AccountIcon, type AccountIconName } from "./AccountIcons";

/* The pages inside /account. All DEMO: data comes from account-demo.ts and
   this browser's storage; buttons that would call the backend just update
   local state. */

const byId = (id: string) => PRODUCTS.find((p) => p.id === id);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });

const input =
  "w-full rounded-md border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/15";
const primaryBtn =
  "inline-flex cursor-pointer items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50";
const linkBtn = "cursor-pointer text-sm font-semibold text-brand hover:underline";

/* Placeholder while signed out / before hydration — AccountShell keeps the
   page hidden until a real user is available. */
const NO_USER: User = { name: "", email: "", phone: "", address: "", memberSince: "" };

function useMe(): User {
  return useUser() ?? NO_USER;
}

function Thumb({ product, size = "h-20 w-20 sm:h-24 sm:w-24" }: { product?: Product; size?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-md bg-ink/[0.04] ${size}`}>
      {product?.image && (
        <Image src={product.image.src} alt={product.name} fill sizes="96px" className="object-cover" style={{ objectPosition: product.image.position }} />
      )}
    </span>
  );
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  Delivered: "bg-emerald-600",
  "Ready for pickup": "bg-amber-500",
  Processing: "bg-brand",
  Cancelled: "bg-ink/50",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-paper ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

function Empty({ icon, title, text, cta }: { icon: AccountIconName; title: string; text: string; cta?: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-tint text-brand">
        <AccountIcon name={icon} className="h-8 w-8" />
      </span>
      <p className="mt-4 font-display text-base font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-ink/55">{text}</p>
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}

const shopCta = (
  <Link href="/shop" className={primaryBtn}>
    Continue shopping
  </Link>
);

function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="-mx-4 -mt-4 mb-4 flex overflow-x-auto border-b border-ink/10 px-4 lg:-mx-5 lg:-mt-5 lg:px-5" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px shrink-0 cursor-pointer border-b-2 px-4 py-3.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
            value === t.id ? "border-brand text-brand" : "border-transparent text-ink/60 hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────────── */

function Box({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-md border border-ink/10">
      <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide">{title}</h2>
        {action}
      </div>
      <div className="min-h-28 px-4 py-4 text-sm">{children}</div>
    </div>
  );
}

export function AccountOverview() {
  const me = useMe();
  return (
    <AccountPanel title="Account Overview">
      <div className="grid gap-4 md:grid-cols-2">
        <Box title="Account details">
          <p className="font-medium">{me.name}</p>
          <p className="mt-1 text-ink/55">{me.email}</p>
          <Link href="/account/management" className={`${linkBtn} mt-4 inline-block`}>
            Manage account
          </Link>
        </Box>
        <Box
          title="Address book"
          action={
            <Link href="/account/addresses" aria-label="Edit address" className="text-brand">
              <AccountIcon name="pencil" className="h-4 w-4" />
            </Link>
          }
        >
          <p className="font-medium">Your default delivery address:</p>
          <p className="mt-1 text-ink/60">{me.name}</p>
          <p className="text-ink/60">{me.address || "No address yet"}</p>
          <p className="text-ink/60">{me.phone}</p>
        </Box>
        <Box title="Store credit">
          <p className="flex items-center gap-2 font-semibold text-brand">
            <AccountIcon name="wallet" className="h-5 w-5" />
            Store credit balance: {formatNaira(STORE_CREDIT)}
          </p>
        </Box>
        <Box title="Newsletter preferences">
          <p>Manage your email updates on offers and new products.</p>
          <Link href="/account/newsletter" className={`${linkBtn} mt-4 inline-block`}>
            Edit newsletter preferences
          </Link>
        </Box>
      </div>
    </AccountPanel>
  );
}

/* ── Orders ───────────────────────────────────────────────────────────── */

const orderTotal = (o: DemoOrder) => o.items.reduce((sum, i) => sum + (byId(i.productId)?.price ?? 0) * i.qty, 0);

function OrderRow({ order }: { order: DemoOrder }) {
  const [open, setOpen] = useState(false);
  const first = byId(order.items[0].productId);
  const more = order.items.length - 1;

  return (
    <li className="rounded-md border border-ink/10 p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        <Thumb product={first} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="line-clamp-2 text-sm sm:text-[15px]">
              {first?.name}
              {more > 0 && <span className="text-ink/55"> + {more} more</span>}
            </p>
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={`${linkBtn} hidden shrink-0 sm:block`}>
              {open ? "Hide details" : "See details"}
            </button>
          </div>
          <p className="mt-0.5 text-xs text-ink/55">Order {order.id}</p>
          <div className="mt-3">
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm font-semibold">On {formatDate(order.date)}</p>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={`${linkBtn} mt-2 sm:hidden`}>
            {open ? "Hide details" : "See details"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 border-t border-ink/10 pt-4 text-sm">
          <ul className="flex flex-col gap-2">
            {order.items.map((i) => {
              const p = byId(i.productId);
              return (
                <li key={i.productId} className="flex items-center gap-3">
                  <Thumb product={p} size="h-10 w-10" />
                  <Link href={`/shop/${i.productId}`} className="min-w-0 flex-1 truncate hover:text-brand">
                    {p?.name}
                  </Link>
                  <span className="text-ink/55">×{i.qty}</span>
                  <span className="w-20 text-right tabular-nums">{formatNaira((p?.price ?? 0) * i.qty)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-ink/10 pt-3">
            <span className="text-ink/55">{order.fulfilment}</span>
            <span className="font-semibold tabular-nums">Total {formatNaira(orderTotal(order))}</span>
          </div>
        </div>
      )}
    </li>
  );
}

export function AccountOrders() {
  const [tab, setTab] = useState<"open" | "closed">("open");
  const open = DEMO_ORDERS.filter((o) => o.status !== "Cancelled");
  const closed = DEMO_ORDERS.filter((o) => o.status === "Cancelled");
  const list = tab === "open" ? open : closed;

  return (
    <AccountPanel title="Orders">
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "open", label: `Ongoing/Delivered (${open.length})` },
          { id: "closed", label: `Cancelled (${closed.length})` },
        ]}
      />
      {list.length ? (
        <ul className="flex flex-col gap-3">
          {list.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </ul>
      ) : (
        <Empty icon="orders" title="No orders here" text="Orders you place will show up here." cta={shopCta} />
      )}
    </AccountPanel>
  );
}

/* ── Inbox ────────────────────────────────────────────────────────────── */

export function AccountInbox() {
  return (
    <AccountPanel title="Inbox Messages">
      <ul className="flex flex-col gap-3">
        {DEMO_MESSAGES.map((m) => {
          const p = byId(m.productId);
          return (
            <li key={m.id} className="rounded-md border border-ink/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-ink/55">{formatDate(m.date)}</p>
                <Link href="/account/orders" className={linkBtn}>
                  See details
                </Link>
              </div>
              <p className="mt-2 font-display text-base font-semibold">{m.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/65">{m.body}</p>
              {p && (
                <Link href={`/shop/${p.id}`} className="mt-3 flex max-w-md items-center gap-3 rounded-md border border-ink/10 p-2 hover:border-ink/25">
                  <Thumb product={p} size="h-14 w-14" />
                  <span className="text-sm">{p.name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </AccountPanel>
  );
}

/* ── Pending reviews ──────────────────────────────────────────────────── */

function ReviewForm({ onDone }: { onDone: () => void }) {
  const [stars, setStars] = useState(0);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (stars) onDone();
      }}
      className="mt-4 flex flex-col gap-3 border-t border-ink/10 pt-4"
    >
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setStars(n)}
            className={`cursor-pointer ${n <= stars ? "text-amber-500" : "text-ink/25"}`}
          >
            <AccountIcon name="star" filled={n <= stars} className="h-7 w-7" />
          </button>
        ))}
      </div>
      <input placeholder="Review title (optional)" className={input} />
      <textarea rows={3} placeholder="What did you like or dislike?" className={`${input} resize-none`} />
      <div>
        <button type="submit" disabled={!stars} className={primaryBtn}>
          Submit review
        </button>
      </div>
    </form>
  );
}

export function AccountReviews() {
  const delivered = DEMO_ORDERS.filter((o) => o.status === "Delivered").flatMap((o) =>
    o.items.map((i) => ({ key: `${o.id}-${i.productId}`, order: o, product: byId(i.productId) })),
  );
  const [done, setDone] = useState<string[]>([]);
  const [rating, setRating] = useState<string | null>(null);
  const pending = delivered.filter((d) => !done.includes(d.key));

  return (
    <AccountPanel title={`Pending Reviews (${pending.length})`}>
      {done.length > 0 && (
        <p className="mb-3 rounded-md bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">Thanks — your review has been submitted.</p>
      )}
      {pending.length ? (
        <ul className="flex flex-col gap-3">
          {pending.map((d) => (
            <li key={d.key} className="rounded-md border border-ink/10 p-3 sm:p-4">
              <div className="flex gap-3 sm:gap-4">
                <Thumb product={d.product} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm sm:text-[15px]">{d.product?.name}</p>
                    {rating !== d.key && (
                      <button type="button" onClick={() => setRating(d.key)} className={`${linkBtn} hidden shrink-0 sm:block`}>
                        Rate this product
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink/70">Order nº: {d.order.id}</p>
                  <p className="text-xs text-emerald-700">Delivered on {formatDate(d.order.date)}</p>
                  {rating !== d.key && (
                    <button type="button" onClick={() => setRating(d.key)} className={`${linkBtn} mt-2 sm:hidden`}>
                      Rate this product
                    </button>
                  )}
                </div>
              </div>
              {rating === d.key && (
                <ReviewForm
                  onDone={() => {
                    setDone((x) => [...x, d.key]);
                    setRating(null);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Empty icon="reviews" title="No pending reviews" text="Products from delivered orders will appear here for you to rate." />
      )}
    </AccountPanel>
  );
}

/* ── Vouchers ─────────────────────────────────────────────────────────── */

export function AccountVouchers() {
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [copied, setCopied] = useState("");
  const active = DEMO_VOUCHERS.filter((v) => !v.used);
  const inactive = DEMO_VOUCHERS.filter((v) => v.used);
  const list = tab === "active" ? active : inactive;

  return (
    <AccountPanel title="Vouchers">
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "active", label: `Active (${active.length})` },
          { id: "inactive", label: `Used/Expired (${inactive.length})` },
        ]}
      />
      {list.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((v) => (
            <li key={v.code} className={`flex overflow-hidden rounded-md border border-ink/10 ${v.used ? "opacity-60" : ""}`}>
              <div className="grid w-24 shrink-0 place-items-center bg-brand px-2 text-center font-display text-lg font-semibold leading-tight text-paper">
                {v.title}
              </div>
              <div className="min-w-0 flex-1 p-3.5">
                <p className="text-sm">{v.detail}</p>
                <p className="mt-1 text-xs text-ink/55">
                  {v.used ? "Used" : `Valid until ${formatDate(v.expires)}`}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <code className="rounded border border-dashed border-ink/25 px-2 py-1 text-xs font-semibold">{v.code}</code>
                  {!v.used && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(v.code).catch(() => {});
                        setCopied(v.code);
                      }}
                      className={linkBtn}
                    >
                      {copied === v.code ? "Copied ✓" : "Copy code"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty icon="voucher" title="No vouchers here" text="Vouchers you receive will show up here." />
      )}
    </AccountPanel>
  );
}

/* ── Wishlist ─────────────────────────────────────────────────────────── */

export function AccountWishlist() {
  const ids = useWishlist();
  const saved = ids.map(byId).filter((p): p is Product => !!p);

  return (
    <AccountPanel title={`Wishlist (${saved.length})`}>
      {saved.length ? (
        <ul className="flex flex-col gap-3">
          {saved.map((p) => (
            <li key={p.id} className="flex gap-3 rounded-md border border-ink/10 p-3 sm:gap-4 sm:p-4">
              <Link href={`/shop/${p.id}`}>
                <Thumb product={p} />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-start sm:gap-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/shop/${p.id}`} className="line-clamp-2 text-sm hover:text-brand sm:text-[15px]">
                    {p.name}
                  </Link>
                  <p className="text-xs text-ink/55">{p.size}</p>
                  <p className="mt-2 font-semibold tabular-nums">{formatNaira(p.price)}</p>
                </div>
                <div className="mt-3 flex items-center gap-3 sm:mt-0 sm:w-40 sm:flex-col sm:items-stretch">
                  <div className="flex-1 sm:flex-none">
                    <AddToCart product={p} size="sm" />
                  </div>
                  <button type="button" onClick={() => toggleWishlist(p.id)} className="cursor-pointer text-xs font-semibold text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty icon="heart" title="Your wishlist is empty" text="Tap the ♡ on any product to save it here." cta={shopCta} />
      )}
    </AccountPanel>
  );
}

/* ── Recently viewed ──────────────────────────────────────────────────── */

export function AccountRecentlyViewed() {
  const ids = useRecentlyViewed();
  const viewed = ids.map(byId).filter((p): p is Product => !!p);

  return (
    <AccountPanel
      title="Recently Viewed"
      action={
        viewed.length > 0 && (
          <button type="button" onClick={clearViewed} className={linkBtn}>
            Clear all
          </button>
        )
      }
    >
      {viewed.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {viewed.map((p) => (
            <li key={p.id}>
              <Link href={`/shop/${p.id}`} className="group block rounded-md border border-ink/10 p-2 transition-shadow hover:shadow-md">
                <Thumb product={p} size="aspect-square w-full" />
                <p className="mt-2 line-clamp-2 text-sm group-hover:text-brand">{p.name}</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">{formatNaira(p.price)}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty icon="history" title="Nothing viewed yet" text="Products you open in the shop will show up here." cta={shopCta} />
      )}
    </AccountPanel>
  );
}

/* ── Settings ─────────────────────────────────────────────────────────── */

function Saved({ show }: { show: boolean }) {
  return show ? <span className="text-sm font-medium text-emerald-700">Saved ✓</span> : null;
}

function useFlash() {
  const [on, setOn] = useState(false);
  return [
    on,
    () => {
      setOn(true);
      setTimeout(() => setOn(false), 2000);
    },
  ] as const;
}

export function AccountManagement() {
  const me = useMe();
  const [saved, flash] = useFlash();
  const [pwSaved, flashPw] = useFlash();

  function onDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    updateUser({ name: String(d.get("name") ?? "").trim() || me.name, phone: String(d.get("phone") ?? "").trim() });
    flash();
  }

  return (
    <AccountPanel title="Account Management">
      <div className="grid gap-5 md:grid-cols-2">
        <form onSubmit={onDetails} className="flex flex-col gap-4 rounded-md border border-ink/10 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Personal details</h2>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Full name</span>
            <input name="name" defaultValue={me.name} autoComplete="name" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Email</span>
            <input value={me.email} readOnly className={`${input} cursor-not-allowed bg-ink/[0.03] text-ink/60`} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Phone</span>
            <input name="phone" type="tel" defaultValue={me.phone} autoComplete="tel" className={input} />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className={primaryBtn}>
              Save
            </button>
            <Saved show={saved} />
          </div>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.currentTarget.reset();
            flashPw();
          }}
          className="flex flex-col gap-4 rounded-md border border-ink/10 p-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide">Change password</h2>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Current password</span>
            <PasswordInput name="current" autoComplete="current-password" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">New password</span>
            <PasswordInput name="new" autoComplete="new-password" />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className={primaryBtn}>
              Update password
            </button>
            <Saved show={pwSaved} />
          </div>
        </form>
      </div>
    </AccountPanel>
  );
}

export function AccountAddresses() {
  const me = useMe();
  const [editing, setEditing] = useState(false);

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    updateUser({ address: String(d.get("address") ?? "").trim(), phone: String(d.get("phone") ?? "").trim() });
    setEditing(false);
  }

  return (
    <AccountPanel title="Address Book">
      {editing ? (
        <form onSubmit={onSave} className="flex max-w-lg flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Delivery address</span>
            <textarea name="address" rows={3} defaultValue={me.address} autoComplete="street-address" className={`${input} resize-none`} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Phone</span>
            <input name="phone" type="tel" defaultValue={me.phone} autoComplete="tel" className={input} />
          </label>
          <div className="flex items-center gap-4">
            <button type="submit" className={primaryBtn}>
              Save address
            </button>
            <button type="button" onClick={() => setEditing(false)} className={linkBtn}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="max-w-md rounded-md border border-ink/10">
          <div className="px-4 py-4 text-sm">
            <p className="font-medium">{me.name}</p>
            <p className="mt-1 text-ink/60">{me.address || "No address yet"}</p>
            <p className="text-ink/60">{me.phone}</p>
            <span className="mt-3 inline-block text-[11px] font-semibold uppercase tracking-wide text-ink/50">Default address</span>
          </div>
          <div className="flex justify-end border-t border-ink/10 px-4 py-2.5">
            <button type="button" onClick={() => setEditing(true)} className={`${linkBtn} flex items-center gap-1.5`}>
              <AccountIcon name="pencil" className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
      )}
    </AccountPanel>
  );
}

export function AccountNewsletter() {
  const me = useMe();
  const [saved, flash] = useFlash();
  const options = [
    { id: "daily", label: "I want to receive daily newsletters" },
    { id: "weekly", label: "I want to receive weekly newsletters" },
    { id: "none", label: "I don't want to receive newsletters" },
  ] as const;

  return (
    <AccountPanel title="Newsletter Preferences">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = new FormData(e.currentTarget).get("newsletter") as User["newsletter"];
          updateUser({ newsletter: v });
          flash();
        }}
        className="flex max-w-lg flex-col gap-4"
      >
        <p className="text-sm text-ink/65">Choose how often you&rsquo;d like to hear about offers and new products.</p>
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Newsletter frequency</legend>
          {options.map((o) => (
            <label key={o.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-ink/10 px-4 py-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-tint">
              <input type="radio" name="newsletter" value={o.id} defaultChecked={(me.newsletter ?? "weekly") === o.id} className="h-4 w-4 accent-[var(--color-brand)]" />
              {o.label}
            </label>
          ))}
        </fieldset>
        <div className="flex items-center gap-3">
          <button type="submit" className={primaryBtn}>
            Save
          </button>
          <Saved show={saved} />
        </div>
      </form>
    </AccountPanel>
  );
}

export function AccountClose() {
  const router = useRouter();
  const [agree, setAgree] = useState(false);

  return (
    <AccountPanel title="Close Account">
      <div className="flex max-w-lg flex-col gap-4 text-sm">
        <p className="text-ink/70">
          Closing your account removes your profile, saved address and order history. This can&rsquo;t be undone.
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="font-medium">Reason (optional)</span>
          <select className={input} defaultValue="">
            <option value="" disabled>
              Choose a reason
            </option>
            <option>I don&rsquo;t use this account any more</option>
            <option>I have another account</option>
            <option>I get too many emails</option>
            <option>Other</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-red-600" />
          I understand my account and its data will be deleted.
        </label>
        <div>
          <button
            type="button"
            disabled={!agree}
            onClick={() => {
              signOut();
              router.push("/");
            }}
            className="cursor-pointer rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Close my account
          </button>
        </div>
      </div>
    </AccountPanel>
  );
}
