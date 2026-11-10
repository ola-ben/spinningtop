import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { getShopSettings } from "@/lib/shop-settings";
import { PRODUCTS, formatNaira } from "@/lib/shop-data";
import { LoginForm, ShopSwitch } from "./AdminForms";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-tint text-ink">
      <header className="border-b border-ink/12 bg-paper">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/spinning-top-logo.jpg"
              alt="Spinning Top Drycleaners and Launderers"
              width={1168}
              height={424}
              className="h-10 w-auto"
            />
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">Admin</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Reads the session cookie, so it renders at request time. */}
        <Suspense fallback={<p className="text-sm text-ink/55">Loading…</p>}>
          <AdminGate />
        </Suspense>
      </main>
    </div>
  );
}

async function AdminGate() {
  if (!adminConfigured()) {
    return (
      <section className="border border-ink/12 bg-paper p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Admin is not set up</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          Add <code className="bg-tint px-1.5 py-0.5 font-mono text-xs">ADMIN_PASSWORD=your-password</code> to{" "}
          <code className="bg-tint px-1.5 py-0.5 font-mono text-xs">.env.local</code>, then restart the server.
        </p>
      </section>
    );
  }

  if (!(await isAdmin())) {
    return (
      <section className="mx-auto max-w-sm border border-ink/12 bg-paper p-6 sm:p-8">
        <p className="eyebrow">Spinning Top</p>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">Admin sign in</h1>
        <LoginForm />
      </section>
    );
  }

  return <AdminPanel />;
}

async function AdminPanel() {
  const { showProducts } = await getShopSettings();
  const inStock = PRODUCTS.filter((p) => p.inStock).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Site settings</h1>
        </div>
        <form action={logout}>
          <button type="submit" className="btn-pill-ghost !px-5 !py-2.5 !text-sm">
            Sign out
          </button>
        </form>
      </div>

      {/* Shop switch */}
      <section className="border border-ink/12 bg-paper p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">Show products on the shop page</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/65">
              <strong className="font-semibold text-ink">On:</strong> /shop lists the products below.{" "}
              <strong className="font-semibold text-ink">Off:</strong> /shop shows &ldquo;Coming soon&rdquo;.
            </p>
          </div>
          <ShopSwitch on={showProducts} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-5 text-sm">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ${
              showProducts ? "bg-emerald-50 text-emerald-700" : "bg-ink/[0.06] text-ink/60"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${showProducts ? "bg-emerald-500" : "bg-ink/40"}`} />
            {showProducts ? "Products live" : "Coming soon showing"}
          </span>
          <Link href="/shop" target="_blank" className="font-semibold text-brand hover:text-brand-deep">
            View /shop ↗
          </Link>
        </div>
      </section>

      {/* Product list (read-only for now) */}
      <section className="border border-ink/12 bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 p-6 sm:px-8">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">Products</h2>
            <p className="mt-1 text-sm text-ink/60">
              {PRODUCTS.length} products · {inStock} in stock
            </p>
          </div>
        </div>
        <ul className="divide-y divide-ink/10">
          {PRODUCTS.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-6 py-4 sm:px-8">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{p.name}</p>
                <p className="text-xs text-ink/55">
                  {p.category} · {p.size}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <span className="font-semibold tabular-nums">{formatNaira(p.price)}</span>
                <span className={`w-20 text-right text-xs ${p.inStock ? "text-emerald-700" : "text-ink/45"}`}>
                  {p.inStock ? "In stock" : "Out of stock"}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="border-t border-ink/10 px-6 py-4 text-xs leading-relaxed text-ink/55 sm:px-8">
          Products are edited in <code className="font-mono">src/lib/shop-data.ts</code> for now. Replace the demo list
          with real stock, prices and safety information before switching the shop on publicly.
        </p>
      </section>
    </div>
  );
}
