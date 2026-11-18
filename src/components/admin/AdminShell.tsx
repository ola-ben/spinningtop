"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOutAdmin } from "@/lib/admin-auth";
import { useAdminCustomers } from "@/lib/admin-customers";
import { useAdminOrders } from "@/lib/admin-orders";
import { useAdminBookings } from "@/lib/admin-bookings";
import { AdminIcon, type AdminIconName } from "./AdminIcons";

type NavItem = { href: string; label: string; icon: AdminIconName; badge?: number };

/* Every admin tab, grouped. Each is its own route under /admin so the
   backend can be wired one screen at a time. */
export const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  { group: "Menu", items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }] },
  {
    group: "Store",
    items: [
      { href: "/admin/products", label: "Products", icon: "products" },
      { href: "/admin/orders", label: "Orders", icon: "orders" },
      { href: "/admin/customers", label: "Customers", icon: "customers" },
      { href: "/admin/reviews", label: "Reviews", icon: "reviews" },
      { href: "/admin/vouchers", label: "Vouchers", icon: "vouchers" },
      { href: "/admin/messages", label: "Messages", icon: "messages" },
    ],
  },
  {
    group: "Business",
    items: [
      { href: "/admin/services", label: "Services", icon: "services" },
      { href: "/admin/academy", label: "Academy", icon: "academy" },
    ],
  },
  {
    group: "General",
    items: [
      { href: "/admin/team", label: "Team & roles", icon: "team" },
      { href: "/admin/settings", label: "Settings", icon: "settings" },
    ],
  },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

function Nav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  // New website sign-ups since the admin last opened Customers.
  const { newCount } = useAdminCustomers();
  // Website orders waiting to be confirmed.
  const { toConfirm } = useAdminOrders();
  // Plus service booking requests nobody has contacted yet (same Orders page).
  const { newCount: newBookings } = useAdminBookings();
  const badgeFor = (item: NavItem) =>
    item.href === "/admin/customers"
      ? newCount
      : item.href === "/admin/orders"
        ? toConfirm + newBookings
        : item.badge;
  return (
    <nav aria-label="Admin" className="flex flex-col gap-5">
      {ADMIN_NAV.map((section) => (
        <div key={section.group}>
          <p className="px-3 pb-1.5 text-xs font-medium text-ink/45">{section.group}</p>
          <ul className="flex flex-col gap-1">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-brand font-semibold text-paper shadow-md shadow-brand/20"
                        : "font-medium text-ink/75 hover:bg-[#f3f4f6] hover:text-ink"
                    }`}
                  >
                    <AdminIcon name={item.icon} className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {badgeFor(item) ? (
                      <span
                        className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${
                          active ? "bg-paper text-brand" : "bg-brand/10 text-brand"
                        }`}
                      >
                        {badgeFor(item)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Bottom of the sidebar: backend status + link to the live site. */
function SidebarFooter() {
  const router = useRouter();
  return (
    <div className="mt-6 flex flex-col gap-2">
      <p className="flex items-center gap-2 px-3 text-xs text-ink/50">
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        Connected to Supabase
      </p>
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-xl bg-[#f3f4f6] px-3 py-2.5 text-sm font-medium text-ink/75 transition-colors hover:text-ink"
      >
        <AdminIcon name="external" className="h-5 w-5" />
        View website
      </Link>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await signOutAdmin();
          router.replace("/admin/login/");
        }}
      >
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <AdminIcon name="logout" className="h-5 w-5" />
          Log out
        </button>
      </form>
    </div>
  );
}

const roundBtn =
  "grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-paper text-ink/70 shadow-sm transition-colors hover:text-ink";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The sign-in page has its own full-screen layout.
  if (pathname.replace(/\/$/, "") === "/admin/login") return <div className="text-ink">{children}</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-ink">
      {/* Top bar — sits on the page background, items are white pills */}
      <header className="sticky top-0 z-30 bg-[#f3f4f6]/90 px-3 backdrop-blur sm:px-4 lg:px-5">
        <div className="flex h-[72px] items-center gap-2 sm:gap-3">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className={`${roundBtn} lg:hidden`}>
            <AdminIcon name="menu" className="h-5 w-5" />
          </button>

          <Link
            href="/admin"
            className="flex h-12 items-center rounded-2xl bg-paper px-3 shadow-sm lg:w-60 lg:shrink-0"
            aria-label="Spinning Top admin — dashboard"
          >
            <Image src="/spinning-top-logo.jpg" alt="Spinning Top" width={1168} height={424} className="h-9 w-auto" />
          </Link>

          <div className="relative ml-auto hidden w-full max-w-md md:block">
            <AdminIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
            <input
              type="search"
              placeholder="Search orders, products…"
              aria-label="Search admin"
              className="h-11 w-full rounded-full bg-paper pl-10 pr-4 text-sm shadow-sm outline-none ring-brand/30 transition placeholder:text-ink/45 focus:ring-2"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <button type="button" aria-label="Notifications" className={roundBtn}>
              <AdminIcon name="bell" className="h-5 w-5" />
            </button>
            <Link href="/admin/settings" aria-label="Help & settings" className={`${roundBtn} hidden sm:grid`}>
              <AdminIcon name="help" className="h-5 w-5" />
            </Link>
            <Link
              href="/admin/profile"
              aria-label="My profile"
              className={`flex items-center gap-2.5 rounded-full bg-paper py-1 pl-1 pr-1 shadow-sm transition-shadow hover:shadow sm:pr-3 ${
                pathname === "/admin/profile" ? "ring-2 ring-brand/30" : ""
              }`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-bold text-paper" aria-hidden="true">
                ST
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-semibold">Spinning Top</span>
                <span className="block text-[11px] text-ink/50">Admin</span>
              </span>
              <AdminIcon name="chevron" className="hidden h-4 w-4 -rotate-90 text-ink/45 sm:block" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-[72px] items-center justify-between px-5">
            <Image src="/spinning-top-logo.jpg" alt="Spinning Top" width={1168} height={424} className="h-8 w-auto" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-[#f3f4f6]"
            >
              <AdminIcon name="close" className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-5">
            <Nav pathname={pathname} onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <SidebarFooter />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-5 px-3 pb-5 sm:px-4 lg:px-5">
        {/* Desktop sidebar — a floating white card */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-92px)] w-60 shrink-0 flex-col overflow-y-auto rounded-2xl bg-paper p-3 pt-4 shadow-sm lg:flex">
          <Nav pathname={pathname} />
          <div className="mt-auto">
            <SidebarFooter />
          </div>
        </aside>

        <main className="mx-auto min-w-0 max-w-[1400px] flex-1 pt-2">{children}</main>
      </div>
    </div>
  );
}
