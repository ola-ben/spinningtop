"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import ShopChrome from "@/components/shop/ShopChrome";
import { signOut, useHydrated, useUser } from "@/lib/user-store";
import { STORE_CREDIT } from "@/lib/account-demo";
import { formatNaira, type Product } from "@/lib/shop-data";
import { AccountIcon, type AccountIconName } from "./AccountIcons";

type NavItem = { href: string; label: string; icon?: AccountIconName };

export const ACCOUNT_NAV: NavItem[] = [
  { href: "/account/orders", label: "Orders", icon: "orders" },
  { href: "/account/inbox", label: "Inbox", icon: "inbox" },
  { href: "/account/reviews", label: "Pending Reviews", icon: "reviews" },
  { href: "/account/vouchers", label: "Vouchers", icon: "voucher" },
  { href: "/account/wishlist", label: "Wishlist", icon: "heart" },
  { href: "/account/recently-viewed", label: "Recently Viewed", icon: "history" },
];

export const ACCOUNT_SETTINGS: NavItem[] = [
  { href: "/account/management", label: "Account Management" },
  { href: "/account/addresses", label: "Address Book" },
  { href: "/account/newsletter", label: "Newsletter Preferences" },
  { href: "/account/close", label: "Close Account" },
];

/* /account/* frame — original shop header, then:
   desktop: account menu on the left, page on the right;
   mobile:  /account is the menu (welcome banner + list), each item opens its page. */
export default function AccountShell({ products, children }: { products: Product[]; children: ReactNode }) {
  const [query, setQuery] = useState("");
  const user = useUser();
  const hydrated = useHydrated();
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const isRoot = pathname === "/account";
  const ready = hydrated && !!user;

  return (
    <ShopChrome products={products} query={query} onQuery={setQuery} navigate>
      <main className="min-h-[70vh] bg-ink/[0.04]">
        <div className="mx-auto max-w-7xl lg:flex lg:items-start lg:gap-5 lg:px-6 lg:py-6">
          {hydrated && !user && <SignedOut />}
          {/* The page always renders (so it can be prerendered); it's only shown
              once the browser has read the signed-in user. */}
          <div className={`w-full lg:flex lg:items-start lg:gap-5 ${ready ? "" : "hidden"}`} aria-busy={!hydrated}>
            <aside className="hidden w-72 shrink-0 overflow-hidden rounded-lg bg-paper shadow-sm lg:block">
              <SideNav pathname={pathname} />
            </aside>
            <div className="min-w-0 flex-1">
              {isRoot && user && <MobileMenu name={user.name} email={user.email} />}
              <div className={isRoot ? "hidden lg:block" : ""}>{children}</div>
            </div>
          </div>
          {!hydrated && <div className="h-[60vh] w-full" />}
        </div>
      </main>
    </ShopChrome>
  );
}

function useLogout() {
  const router = useRouter();
  return () => {
    signOut();
    router.push("/");
  };
}

/* Desktop sidebar */
function SideNav({ pathname }: { pathname: string }) {
  const logout = useLogout();
  const row = (active: boolean) =>
    `flex items-center gap-4 px-4 py-3 text-sm transition-colors ${
      active ? "bg-ink/[0.08] font-semibold text-ink" : "text-ink/80 hover:bg-ink/[0.04]"
    }`;

  return (
    <nav aria-label="My account">
      <ul>
        {[{ href: "/account", label: "My Account", icon: "user" as const }, ...ACCOUNT_NAV].map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={row(active)}>
                {item.icon && <AccountIcon name={item.icon} className="h-5 w-5 shrink-0 text-ink/70" />}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <ul className="border-t border-ink/10">
        {ACCOUNT_SETTINGS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={row(active)}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-ink/10 p-2">
        <button
          type="button"
          onClick={logout}
          className="w-full cursor-pointer rounded-md py-2.5 text-sm font-semibold uppercase tracking-wide text-brand transition-colors hover:bg-tint"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

/* Mobile /account — the menu itself */
function MobileMenu({ name, email }: { name: string; email: string }) {
  const logout = useLogout();
  const row = "flex items-center gap-4 border-b border-ink/[0.06] bg-paper px-4 py-3.5 text-[15px] text-ink last:border-b-0";
  const heading = "bg-ink/[0.04] px-4 pb-2 pt-4 text-xs font-medium uppercase tracking-wide text-ink/50";

  return (
    <nav aria-label="My account" className="lg:hidden">
      <div className="bg-brand px-4 py-4 text-paper">
        <p className="font-display text-lg font-semibold">Welcome, {name.split(" ")[0]}</p>
        <p className="truncate text-xs text-paper/80">{email}</p>
      </div>
      <p className="flex items-center gap-3 bg-paper px-4 py-3.5 text-sm font-semibold text-brand">
        <AccountIcon name="wallet" className="h-5 w-5" />
        Store credit balance: {formatNaira(STORE_CREDIT)}
      </p>

      <p className={heading}>My account</p>
      <ul>
        {ACCOUNT_NAV.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={row}>
              {item.icon && <AccountIcon name={item.icon} className="h-5 w-5 shrink-0 text-ink/70" />}
              <span className="flex-1">{item.label}</span>
              <AccountIcon name="right" className="h-4 w-4 text-ink/60" />
            </Link>
          </li>
        ))}
      </ul>

      <p className={heading}>Account settings</p>
      <ul>
        {ACCOUNT_SETTINGS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={row}>
              <span className="flex-1">{item.label}</span>
              <AccountIcon name="right" className="h-4 w-4 text-ink/60" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="bg-ink/[0.04] px-4 py-6">
        <button
          type="button"
          onClick={logout}
          className="w-full cursor-pointer py-2 text-sm font-semibold uppercase tracking-wide text-brand"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function SignedOut() {
  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl bg-paper p-8 text-center shadow-sm">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-tint text-brand">
          <AccountIcon name="user" className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold tracking-tight">Sign in to your account</h1>
        <p className="mt-1.5 text-sm text-ink/55">See your orders, messages and saved items.</p>
        <Link
          href="/login"
          className="mt-6 inline-flex w-full justify-center rounded-full bg-brand py-3 text-sm font-bold text-paper transition-colors hover:bg-brand-deep"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

/** Content card used by every account page: title bar (with a back arrow on mobile) + body. */
export function AccountPanel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-h-[60vh] bg-paper shadow-sm lg:rounded-lg">
      <div className="flex items-center gap-2 border-b border-ink/10 px-4 py-3.5 lg:px-5">
        <Link href="/account" aria-label="Back to my account" className="-ml-1.5 grid h-8 w-8 place-items-center rounded-full hover:bg-ink/[0.05] lg:hidden">
          <AccountIcon name="left" className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 font-display text-lg font-semibold tracking-tight">{title}</h1>
        {action}
      </div>
      <div className="p-4 lg:p-5">{children}</div>
    </section>
  );
}
