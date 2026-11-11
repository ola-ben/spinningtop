import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BRANCHES, LINK_HUB, PHONE_DISPLAY, PHONE_E164, SOCIALS, whatsappLink } from "@/lib/site";
import SocialIcon from "@/components/SocialIcon";

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Services",
    links: [
      { label: "Laundry", href: "/services/laundry" },
      { label: "Wet & dry cleaning", href: "/services/cleaning" },
      { label: "Tailoring & alterations", href: "/services/tailor" },
      { label: "Shoe repair", href: "/services/shoe" },
      { label: "Upholstery & rugs", href: "/services/upholstery" },
      { label: "Pest control", href: "/services/pest" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Product shop", href: "/shop" },
      { label: "Training Academy", href: "/academy" },
      { label: "Corporate", href: "/corporate" },
      { label: "Visit us", href: "/#visit" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "WhatsApp", href: whatsappLink(), external: true },
      { label: `Call ${PHONE_DISPLAY}`, href: `tel:${PHONE_E164}`, external: true },
      { label: "Request a quote", href: LINK_HUB, external: true },
      ...BRANCHES.map((b) => ({ label: b.name, href: b.mapUrl, external: true })),
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
];

const linkClass = "text-sm text-ink/60 transition-colors hover:text-brand";

function FooterAnchor({ link, children }: { link: FooterLink; children: ReactNode }) {
  if (link.external) {
    const newTab = link.href.startsWith("http");
    return (
      <a
        href={link.href}
        className={linkClass}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={link.href} className={linkClass}>
      {children}
    </Link>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Brand + link columns */}
        <div className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" aria-label="Spinning Top — home" className="inline-block">
              <Image
                src="/spinning-top-logo.jpg"
                alt="Spinning Top Drycleaners and Launderers"
                width={1168}
                height={424}
                className="h-11 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">
              Professional care for clothes and spaces. Products and practical training — one trusted brand.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-ink">{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <FooterAnchor link={link}>{link.label}</FooterAnchor>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar: copyright + socials.
            Extra space (bottom on mobile, right from sm) so the floating
            WhatsApp button and mobile quote bar never cover anything. */}
        <div className="flex flex-col-reverse gap-5 border-t border-ink/10 pb-28 pt-6 sm:flex-row sm:items-center sm:justify-between sm:pb-6 sm:pr-20">
          <p className="text-xs text-ink/50">© 2026 Spinning Top Drycleaners &amp; Launderers. All rights reserved.</p>
          <ul className="flex items-center gap-4">
            {SOCIALS.map((s) => (
              <li key={s.id}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Spinning Top on ${s.label}`}
                  title={s.label}
                  className="block text-ink/50 transition-colors hover:text-brand"
                >
                  <SocialIcon id={s.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
