"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PHONE_DISPLAY, PHONE_E164, QUOTE_LINK, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/SocialIcon";
import {
  CartIcon,
  ChevronDownIcon,
  CloseIcon,
  HelpIcon,
  MenuIcon,
  PhoneIcon,
  PinIcon,
  UserIcon,
} from "./ShopIcons";
import ShopSearch from "./ShopSearch";
import type { Product } from "@/lib/shop-data";

type Props = {
  query: string;
  onQuery: (q: string) => void;
  products: Product[];
  cartCount: number;
  onOpenCart: () => void;
};

type MenuName = "account" | "help" | null;

/* Shop-only header (replaces the site header on /shop):
   desktop — ☰ · logo · search · Account · Help · Cart
   mobile  — ☰ · logo · account · cart, with search on its own row. */
export default function ShopHeader({ query, onQuery, products, cartCount, onOpenCart }: Props) {
  const [openMenu, setOpenMenu] = useState<MenuName>(null);
  const [drawer, setDrawer] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape.
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  // Lock scroll + hide floating buttons while the side menu is open.
  useEffect(() => {
    if (!drawer) return;
    document.body.style.overflow = "hidden";
    document.body.dataset.menu = "open";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      delete document.body.dataset.menu;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  const toggle = (name: Exclude<MenuName, null>) => setOpenMenu((m) => (m === name ? null : name));

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper shadow-[0_1px_3px_rgba(49,49,49,0.06)]">
        <div
          ref={barRef}
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-3 px-4 py-3 sm:px-6 md:flex-nowrap md:gap-x-6"
        >
          {/* Menu + logo */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
              aria-expanded={drawer}
              className="-ml-2 grid h-10 w-10 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-ink/[0.05]"
            >
              <MenuIcon />
            </button>
            <Link href="/" aria-label="Spinning Top — home">
              <Image
                src="/spinning-top-logo.jpg"
                alt="Spinning Top Drycleaners and Launderers"
                width={1168}
                height={424}
                preload
                className="h-9 w-auto sm:h-11"
              />
            </Link>
          </div>

          {/* Search — own row on mobile, inline from md */}
          <ShopSearch query={query} onQuery={onQuery} products={products} />

          {/* Account · Help · Cart */}
          <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0 md:gap-2">
            <Dropdown
              name="account"
              open={openMenu === "account"}
              onToggle={() => toggle("account")}
              icon={<UserIcon />}
              label="Account"
            >
              <p className="font-display text-sm font-semibold text-ink">Customer accounts are coming soon.</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink/60">
                For now, add products to your cart and send your order request to us on WhatsApp.
              </p>
              <a
                href={whatsappLink("Hello Spinning Top, I have a question about ordering products.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-bold text-paper transition-colors hover:bg-brand-deep"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Order on WhatsApp
              </a>
            </Dropdown>

            <Dropdown
              name="help"
              open={openMenu === "help"}
              onToggle={() => toggle("help")}
              icon={<HelpIcon />}
              label="Help"
              className="hidden md:block"
            >
              <HelpLinks />
            </Dropdown>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
              className="flex cursor-pointer items-center gap-2 rounded-full p-2 text-ink transition-colors hover:text-brand lg:px-3"
            >
              <span className="relative">
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-paper">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="hidden text-[15px] font-semibold lg:inline">Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Side menu */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
          drawer ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!drawer}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close menu"
          onClick={() => setDrawer(false)}
          className="absolute inset-0 cursor-default bg-ink/40"
        />
        <nav
          aria-label="Main menu"
          className={`absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col overflow-y-auto bg-paper shadow-2xl transition-transform duration-300 ease-out ${
            drawer ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <Image src="/spinning-top-logo.jpg" alt="Spinning Top" width={1168} height={424} className="h-9 w-auto" />
            <button
              type="button"
              onClick={() => setDrawer(false)}
              tabIndex={drawer ? 0 : -1}
              aria-label="Close menu"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-ink/[0.05]"
            >
              <CloseIcon />
            </button>
          </div>

          <p className="eyebrow px-5 pb-2 pt-5">Spinning Top</p>
          <ul className="text-[15px]">
            {[
              { href: "/", label: "Home" },
              { href: "/shop", label: "Product shop", current: true },
              { href: "/services", label: "Care services" },
              { href: "/academy", label: "Training Academy" },
              { href: "/corporate", label: "Corporate" },
              { href: "/#visit", label: "Visit us" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  tabIndex={drawer ? 0 : -1}
                  aria-current={l.current ? "page" : undefined}
                  onClick={() => setDrawer(false)}
                  className={`block px-5 py-3 transition-colors hover:bg-tint hover:text-brand ${
                    l.current ? "font-semibold text-brand" : "text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="eyebrow mt-4 border-t border-ink/10 px-5 pb-2 pt-5">Need help?</p>
          <div className="px-2 pb-4">
            <HelpLinks tabbable={drawer} onNavigate={() => setDrawer(false)} />
          </div>

          <div className="mt-auto border-t border-ink/10 p-5">
            <a
              href={QUOTE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={drawer ? 0 : -1}
              className="block rounded-full bg-brand py-3 text-center text-sm font-bold text-paper transition-colors hover:bg-brand-deep"
            >
              Request a quote
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}

function Dropdown({
  name,
  open,
  onToggle,
  icon,
  label,
  className = "",
  children,
}: {
  name: string;
  open: boolean;
  onToggle: () => void;
  icon: ReactNode;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const panelId = `shop-${name}-menu`;
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        className={`flex cursor-pointer items-center gap-2 rounded-full p-2 transition-colors hover:text-brand lg:px-3 ${
          open ? "text-brand" : "text-ink"
        }`}
      >
        {icon}
        <span className="hidden text-[15px] font-semibold lg:inline">{label}</span>
        <ChevronDownIcon className={`hidden h-4 w-4 transition-transform lg:block ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-10 mt-2 w-72 border border-ink/10 bg-paper p-5 shadow-xl shadow-ink/10"
        >
          {children}
        </div>
      )}
    </div>
  );
}

function HelpLinks({ tabbable = true, onNavigate }: { tabbable?: boolean; onNavigate?: () => void }) {
  const row =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-tint hover:text-brand";
  const tab = tabbable ? 0 : -1;
  return (
    <ul className="-mx-2 flex flex-col">
      <li>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" tabIndex={tab} className={row}>
          <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
          Chat on WhatsApp
        </a>
      </li>
      <li>
        <a href={`tel:${PHONE_E164}`} tabIndex={tab} className={row}>
          <PhoneIcon className="h-5 w-5 text-ink/50" />
          Call {PHONE_DISPLAY}
        </a>
      </li>
      <li>
        <Link href="/#visit" tabIndex={tab} onClick={onNavigate} className={row}>
          <PinIcon className="h-5 w-5 text-ink/50" />
          Visit our outlets
        </Link>
      </li>
      <li>
        <Link href="/#how" tabIndex={tab} onClick={onNavigate} className={row}>
          <HelpIcon className="h-5 w-5 text-ink/50" />
          How it works
        </Link>
      </li>
    </ul>
  );
}
