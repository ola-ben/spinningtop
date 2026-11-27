import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ArrowIcon from "@/components/ArrowIcon";
import FloatingActions from "@/components/FloatingActions";
import { BRANCHES, LINK_HUB, PHONE_DISPLAY, PHONE_E164, SITE_NAME, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Spinning Top Drycleaners & Launderers is a garment and home-care business in Ibadan: care services, a laundry and hygiene product shop, and a training academy.",
  alternates: { canonical: "/about" },
};

/* /about — who Spinning Top is. Only facts already used elsewhere on the site
   (Brand Book copy, outlets, service rule, legal details): no invented history,
   numbers or guarantees. */

const PILLARS = [
  {
    no: "01",
    title: "Care Services",
    text: "Laundry, wet and dry cleaning, tailoring and alterations, shoe repair, upholstery and rug cleaning, janitorial services and pest control.",
    href: "/services",
    cta: "Explore services",
  },
  {
    no: "02",
    title: "Product Shop",
    text: "Laundry and hygiene products we use and trust, available to buy online with pickup from our outlets or delivery.",
    href: "/shop",
    cta: "Visit the shop",
  },
  {
    no: "03",
    title: "Training Academy",
    text: "Hands-on, practical training in professional fabric care for people who want to learn the trade.",
    href: "/academy",
    cta: "About the Academy",
  },
];

const RULE = [
  { title: "Inspect first.", text: "We check every item or space before we start, and note anything that needs special care." },
  { title: "Explain scope.", text: "We tell you what we will do, what is possible and any limits we see." },
  { title: "Confirm price.", text: "You agree the price and timeline before any work begins." },
  { title: "Check the result.", text: "Work is quality-checked before it is handed back to you." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main>
        {/* Intro */}
        <section className="border-b border-ink/10 bg-tint">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="eyebrow">About us</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl">
              Better care. Easier living. Brighter futures.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/70 md:text-lg">
              {SITE_NAME} is a garment and home-care business in Ibadan, Oyo State. We clean, repair and care for clothes, shoes and spaces,
              sell the laundry and hygiene products we trust, and train people in professional fabric care.
            </p>
          </div>
        </section>

        {/* What we do */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="max-w-xl">
            <p className="eyebrow">What we do</p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-display text-ink sm:text-4xl">One brand, three pillars.</h2>
          </div>
          <div className="mt-12 grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-3">
            {PILLARS.map((p) => (
              <article key={p.no} className="flex flex-col bg-paper p-6 sm:p-8">
                <span className="font-mono text-xs text-ink/45">{p.no}</span>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">{p.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/65">{p.text}</p>
                <Link href={p.href} className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep">
                  {p.cta}
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink/65">
            We also look after hotels, schools, offices and healthcare facilities with{" "}
            <Link href="/corporate" className="font-semibold text-brand hover:underline">
              corporate laundry and cleaning
            </Link>
            .
          </p>
        </section>

        {/* How we work */}
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/60">How we work</p>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-display sm:text-4xl">Our service rule.</h2>
            <ol className="mt-12 grid gap-px bg-paper/15 sm:grid-cols-2 lg:grid-cols-4">
              {RULE.map((r, i) => (
                <li key={r.title} className="bg-ink p-6 sm:p-8">
                  <span className="font-mono text-sm text-accent">0{i + 1}</span>
                  <p className="mt-4 font-display text-xl font-semibold tracking-tight">{r.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-paper/65">{r.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Where to find us */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="max-w-xl">
            <p className="eyebrow">Where to find us</p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-display text-ink sm:text-4xl">Two outlets in Ibadan.</h2>
          </div>
          <div className="mt-12 grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-2">
            {BRANCHES.map((b) => (
              <article key={b.id} className="flex flex-col bg-paper p-6 sm:p-8">
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">{b.name}</h3>
                <address className="mt-3 text-sm not-italic leading-relaxed text-ink/65">
                  {b.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                {b.hours && (
                  <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
                    {b.hours.map((h) => (
                      <div key={h.days} className="contents">
                        <dt className="text-ink/55">{h.days}</dt>
                        <dd className="text-ink">{h.time}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <a
                  href={b.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep"
                >
                  Get directions
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Company details + contact */}
        <section className="border-t border-ink/10 bg-tint">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:gap-16">
            <div>
              <p className="eyebrow">Get in touch</p>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-display text-ink sm:text-3xl">
                Tell us what you need. We&rsquo;ll inspect and quote first.
              </h2>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={LINK_HUB} target="_blank" rel="noopener noreferrer" className="btn-pill">
                  Request a quote <ArrowIcon />
                </a>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-pill-ghost">
                  Chat on WhatsApp
                </a>
              </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] content-start gap-x-6 gap-y-3 text-sm">
              <dt className="text-ink/55">Registered name</dt>
              <dd className="text-ink">SPINNING TOP DRYCLEANERS AND LAUNDERERS LIMITED</dd>
              <dt className="text-ink/55">Trading as</dt>
              <dd className="text-ink">{SITE_NAME}</dd>
              <dt className="text-ink/55">Phone / WhatsApp</dt>
              <dd>
                <a href={`tel:${PHONE_E164}`} className="text-ink hover:text-brand">
                  {PHONE_DISPLAY}
                </a>
              </dd>
              <dt className="text-ink/55">Email</dt>
              <dd>
                <a href="mailto:admin@spinningtop.ng" className="text-ink hover:text-brand">
                  admin@spinningtop.ng
                </a>
              </dd>
              <dt className="text-ink/55">Legal</dt>
              <dd className="flex flex-wrap gap-x-4 gap-y-1">
                <Link href="/privacy" className="text-ink hover:text-brand">
                  Privacy policy
                </Link>
                <Link href="/terms" className="text-ink hover:text-brand">
                  Terms of service
                </Link>
              </dd>
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingActions />
    </div>
  );
}
