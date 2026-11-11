"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminIcon, type AdminIconName } from "./AdminIcons";

type NavItem = { href: string; label: string; icon: AdminIconName; badge?: number };

/* Every admin tab, grouped. Each is its own route under /admin so the
   backend can be wired one screen at a time. */
export const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }] },
  {
    group: "Store",
    items: [
      { href: "/admin/products", label: "Products", icon: "products" },
      { href: "/admin/orders", label: "Orders", icon: "orders" },
      { href: "/admin/customers", label: "Customers", icon: "customers" },
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
    group: "System",
    items: [
      { href: "/admin/team", label: "Team & roles", icon: "team" },
      { href: "/admin/settings", label: "Settings", icon: "settings" },
    ],
  },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

function Nav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {ADMIN_NAV.map((section) => (
        <div key={section.group}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">{section.group}</p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-brand text-paper shadow-sm shadow-brand/20" : "text-ink/70 hover:bg-ink/[0.05] hover:text-ink"
                    }`}
                  >
                    <AdminIcon name={item.icon} className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span
                        className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${
                          active ? "bg-paper text-brand" : "bg-brand text-paper"
                        }`}
                      >
                        {item.badge}
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

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <Image src="/spinning-top-logo.jpg" alt="Spinning Top" width={1168} height={424} className="h-9 w-auto" />
      <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper">Admin</span>
    </Link>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const current = ADMIN_NAV.flatMap((s) => s.items).find((i) => isActive(pathname, i.href));

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

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink/10 bg-paper lg:flex">
        <div className="flex h-16 items-center border-b border-ink/10 px-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <Nav pathname={pathname} />
        </div>
        <div className="border-t border-ink/10 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
            View website
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
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
          <div className="flex h-16 items-center justify-between border-b border-ink/10 px-5">
            <Brand />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-ink/[0.05]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <Nav pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink/10 bg-paper/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="-ml-1 grid h-10 w-10 cursor-pointer place-items-center rounded-full hover:bg-ink/[0.05] lg:hidden"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
          <p className="truncate text-sm font-semibold text-ink lg:hidden">{current?.label ?? "Admin"}</p>

          <div className="relative ml-auto hidden w-full max-w-sm md:block">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search orders, products, customers…"
              aria-label="Search admin"
              className="w-full rounded-full border border-ink/10 bg-ink/[0.04] py-2 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:bg-paper"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <span className="hidden rounded-full bg-ink/[0.06] px-2.5 py-1 text-[11px] font-semibold text-ink/60 sm:inline">
              Backend not connected
            </span>
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full text-ink/70 hover:bg-ink/[0.05]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.86 17.08a23.85 23.85 0 0 0 5.45-1.31A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.97 8.97 0 0 1-2.31 6.02c1.73.64 3.56 1.09 5.45 1.31m5.72 0a24.26 24.26 0 0 1-5.72 0m5.72 0a3 3 0 1 1-5.72 0" />
              </svg>
            </button>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-paper" aria-label="Signed in as Business Owner">
              BO
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
