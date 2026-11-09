import Image from "next/image";
import { LINK_HUB, NAV } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-ink/12 bg-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <Image
            src="/spinning-top-logo.jpg"
            alt="Spinning Top Drycleaners and Launderers"
            width={1168}
            height={424}
            className="h-12 w-auto"
          />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/65">
            Professional care for clothes and spaces. Products and practical training — one trusted brand.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-ink/70 transition-colors hover:text-brand">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow">Enquiries</p>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">
            Request a quote, ask about availability, or enquire about the next training intake through our link hub.
          </p>
          <a
            href={LINK_HUB}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-brand transition-colors hover:text-brand-deep"
          >
            linktr.ee/spinningtoplaundry ↗
          </a>
        </div>
      </div>

      <div className="border-t border-ink/12">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 font-mono text-[11px] uppercase tracking-wider text-ink/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 Spinning Top Drycleaners &amp; Launderers</p>
          <p>Better care. Easier living. Brighter futures.</p>
        </div>
      </div>
    </footer>
  );
}
