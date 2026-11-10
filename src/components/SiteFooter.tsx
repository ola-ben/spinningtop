import Image from "next/image";
import Link from "next/link";
import { BRANCHES, LINK_HUB, NAV, PHONE_DISPLAY, PHONE_E164, SOCIALS, whatsappLink } from "@/lib/site";
import SocialIcon, { WhatsAppIcon } from "@/components/SocialIcon";

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

          <p className="eyebrow mt-8">Follow us</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SOCIALS.map((s) => (
              <li key={s.id}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Spinning Top on ${s.label}`}
                  title={s.label}
                  className="grid h-10 w-10 place-items-center border border-ink/15 text-ink/60 transition-colors hover:border-brand hover:bg-brand hover:text-paper"
                >
                  <SocialIcon id={s.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink/70 transition-colors hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow">Enquiries</p>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">
            Request a quote, ask about availability, or enquire about the next training intake.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium text-ink transition-colors hover:text-brand"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                WhatsApp {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={`tel:${PHONE_E164}`} className="inline-flex items-center gap-2 font-medium text-ink transition-colors hover:text-brand">
                <svg className="h-4 w-4 text-ink/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.28 6.72 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.37c0-.52-.35-.97-.85-1.09l-4.42-1.11c-.44-.11-.9.06-1.17.42l-.97 1.29a1.12 1.12 0 0 1-1.21.38 12.04 12.04 0 0 1-7.14-7.14 1.12 1.12 0 0 1 .38-1.21l1.29-.97c.36-.27.53-.73.42-1.17L6.97 3.6a1.12 1.12 0 0 0-1.09-.85H4.5A2.25 2.25 0 0 0 2.25 5v1.75z" />
                </svg>
                Call {PHONE_DISPLAY}
              </a>
            </li>
          </ul>
          <a
            href={LINK_HUB}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-brand transition-colors hover:text-brand-deep"
          >
            linktr.ee/spinningtoplaundry ↗
          </a>

          <p className="eyebrow mt-8">Outlets</p>
          <ul className="mt-4 space-y-3 text-sm">
            {BRANCHES.map((b) => (
              <li key={b.id}>
                <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-ink transition-colors hover:text-brand">
                  {b.name}
                </a>
                {b.hours && (
                  <span className="block text-ink/55">
                    {b.hours.filter((h) => h.opens).map((h) => `${h.days.replace(" – ", "–").replace("Monday", "Mon").replace("Friday", "Fri").replace("Saturday", "Sat")} ${h.time.replace(":00", "").replace(":00", "")}`).join(" · ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/12">
        {/* Extra bottom space on mobile so the floating quote bar never covers it */}
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 pb-28 pt-6 sm:py-6 font-mono text-[11px] uppercase tracking-wider text-ink/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 Spinning Top Drycleaners &amp; Launderers</p>
          <p>Better care. Easier living. Brighter futures.</p>
        </div>
      </div>
    </footer>
  );
}
