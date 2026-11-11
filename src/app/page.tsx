import Link from "next/link";
import Reveal from "@/components/Reveal";
import RotatingWord from "@/components/RotatingWord";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ArrowIcon from "@/components/ArrowIcon";
import ImageSlot from "@/components/ImageSlot";
import SwipeRail from "@/components/SwipeRail";
import FloatingActions from "@/components/FloatingActions";
import ServiceIcon, { type ServiceIconName } from "@/components/ServiceIcon";
import {
  BRANCHES,
  GOOGLE_RATING,
  LINK_HUB,
  PHONE_E164,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIALS,
} from "@/lib/site";
import OpenStatus from "@/components/OpenStatus";
import { IMAGES } from "@/lib/images";

/* All copy below is taken from the Spinning Top Brand Book v2.2.
   Rule of thumb from the book: no unverified claims, no guarantees,
   and no booking / tracking / checkout until those are operational.
   Below the hero the page is deliberately quiet: white space, hairlines,
   charcoal headings — blue is reserved for actions and hover states. */

const HERO_WORDS = ["clothes.", "shoes.", "home.", "future."];

const PILLARS = [
  {
    no: "01",
    title: "Care Services",
    desc: "Laundry, cleaning, repairs & pest control.",
    href: "/services",
    image: IMAGES.pillarServices,
  },
  {
    no: "02",
    title: "Product Shop",
    desc: "Laundry & hygiene products.",
    href: "/shop",
    image: IMAGES.pillarShop,
  },
  {
    no: "03",
    title: "Training Academy",
    desc: "Hands-on fabric care training.",
    href: "/academy",
    image: IMAGES.pillarAcademy,
  },
];

/* Deliberately no pickup/delivery promise — Brand Book p.15 says not to
   advertise booking or logistics until they are operational. */
const HOW_STEPS = [
  {
    title: "Tell us what you need",
    desc: "Visit a branch or message us.",
  },
  {
    title: "We inspect & quote",
    desc: "Price and timeline confirmed first.",
  },
  {
    title: "Collect when it’s ready",
    desc: "Quality-checked before handover.",
  },
];

const SERVICES: { title: string; icon: ServiceIconName }[] = [
  { title: "Laundry", icon: "laundry" },
  { title: "Wet & Dry Cleaning", icon: "cleaning" },
  { title: "Tailor Repairs & Alterations", icon: "tailor" },
  { title: "Shoe Repair / Cobbler", icon: "shoe" },
  { title: "Upholstery & Rug Cleaning", icon: "upholstery" },
  { title: "Pest Control", icon: "pest" },
];

/* Structured data for search engines (schema.org). Main entity = Oluyole
   branch; the Dominion University outlet is listed as a department.
   Add `telephone` once the official number is confirmed. */
const [MAIN_BRANCH, ...OTHER_BRANCHES] = BRANCHES;

const postalAddress = (b: (typeof BRANCHES)[number]) => ({
  "@type": "PostalAddress",
  streetAddress: b.street,
  addressLocality: b.locality,
  addressRegion: b.region,
  ...(b.postalCode ? { postalCode: b.postalCode } : {}),
  addressCountry: "NG",
});

const openingHoursSpec = (b: (typeof BRANCHES)[number]) =>
  b.hours
    ?.filter((h) => h.opens && h.closes)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.schemaDays,
      opens: h.opens,
      closes: h.closes,
    }));

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "DryCleaningOrLaundry",
  name: SITE_NAME,
  alternateName: "Spinning Top",
  description: SITE_DESCRIPTION,
  slogan: "Better care. Easier living. Brighter futures.",
  url: SITE_URL,
  logo: `${SITE_URL}/spinning-top-logo.jpg`,
  image: `${SITE_URL}/opengraph-image.png`,
  address: postalAddress(MAIN_BRANCH),
  hasMap: MAIN_BRANCH.mapUrl,
  openingHoursSpecification: openingHoursSpec(MAIN_BRANCH),
  areaServed: { "@type": "City", name: "Ibadan" },
  telephone: PHONE_E164,
  sameAs: [LINK_HUB, ...SOCIALS.map((s) => s.href)],
  knowsAbout: SERVICES.map((s) => s.title),
  department: OTHER_BRANCHES.map((b) => ({
    "@type": "DryCleaningOrLaundry",
    name: `Spinning Top — ${b.name}`,
    address: postalAddress(b),
    hasMap: b.mapUrl,
  })),
};

/** Enquiry link: opens the Linktree hub. */
function ExternalCta({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <a href={LINK_HUB} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

/** Quiet text link used for section-level actions below the hero. */
const textLink =
  "group inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-deep";

export default function Home() {
  return (
    <div id="top" className="min-h-screen bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />

      <main>
        {/* 1. HERO ------------------------------------------------------ */}
        <section className="relative overflow-hidden bg-tint">
          {/* Geometric blocks — "clean geometric blocks" from the graphic language */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
            {/* 1. Soft dot grid — strongest behind the photo, fading out toward the headline */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(rgba(0, 0, 254, 0.16) 1px, transparent 1.4px)",
                backgroundSize: "22px 22px",
                maskImage: "radial-gradient(ellipse 60% 70% at 75% 50%, #000 0%, transparent 75%)",
                WebkitMaskImage: "radial-gradient(ellipse 60% 70% at 75% 50%, #000 0%, transparent 75%)",
              }}
            />
            {/* 2. Thin concentric rings behind the photo — ripples / a spinning top in motion.
                Centred under the photo: lower middle on mobile, right column on desktop. */}
            <div className="absolute left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2 lg:left-[74%] lg:top-1/2">
              {["h-[22rem] w-[22rem]", "h-[34rem] w-[34rem]", "h-[46rem] w-[46rem]", "h-[58rem] w-[58rem]"].map((size, i) => (
                <div
                  key={size}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand ${size}`}
                  style={{ opacity: 0.14 - i * 0.03 }}
                />
              ))}
            </div>
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:gap-14 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-16">
            <div className="lg:col-span-7">
              <Reveal className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/70 sm:text-[11px]">
                <span className="h-1.5 w-1.5 shrink-0 rotate-45 animate-pulse bg-brand" />
                <span>Drycleaners &amp; Launderers</span>
              </Reveal>

              <Reveal as="h1" delay={100} className="mt-6 font-display text-[2.6rem] font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Better care for your <br className="hidden sm:block" />
                <RotatingWord words={HERO_WORDS} className="text-brand" />
              </Reveal>

              <Reveal as="p" delay={200} className="mt-6 max-w-xl text-base leading-relaxed text-ink/70 md:text-lg">
                Garment &amp; home care, laundry products and training in Ibadan.
              </Reveal>

              <Reveal delay={300} className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                <ExternalCta className="btn-pill">
                  Request a quote <ArrowIcon />
                </ExternalCta>
                <Link href="/services" className="btn-pill-ghost">
                  Explore services
                </Link>
              </Reveal>

              {/* Real, verifiable facts (Google listing + branches) */}
              <Reveal delay={400} className="mt-12 max-w-xl border-t border-ink/15 pt-8">
                <div className="grid grid-cols-3 gap-3 sm:gap-10">
                  <a
                    href={GOOGLE_RATING.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group min-w-0"
                    aria-label={`Rated ${GOOGLE_RATING.value} out of 5 on Google from ${GOOGLE_RATING.count} reviews`}
                  >
                    <p className="flex items-center gap-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                      {GOOGLE_RATING.value}
                      <svg className="h-5 w-5 text-[#FBBC04] sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6-4.9-4.5 6.6-.8z" />
                      </svg>
                    </p>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-ink/60 transition-colors group-hover:text-brand sm:text-sm">
                      Google rating · {GOOGLE_RATING.count} reviews
                    </p>
                  </a>
                  <a href="#visit" className="group min-w-0">
                    <p className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{BRANCHES.length}</p>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-ink/60 transition-colors group-hover:text-brand sm:text-sm">
                      Outlets in Ibadan
                    </p>
                  </a>
                  <a href="#visit" className="group min-w-0">
                    <p className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Mon–Sat</p>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-ink/60 transition-colors group-hover:text-brand sm:text-sm">
                      Open from 8 AM
                    </p>
                  </a>
                </div>
                {BRANCHES[0].hours && (
                  <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-ink/55">
                    <span>{BRANCHES[0].name}:</span>
                    <OpenStatus hours={BRANCHES[0].hours} />
                  </div>
                )}
              </Reveal>
            </div>

            {/* Photo + overlapping service rule card */}
            {/* Layout:
                - mobile: photo full-bleed, card stacked below overlapping its bottom edge
                - sm/md (single column): wide photo, card floats over its lower-left corner
                - lg: tall photo offset right, card overlaps its lower-left and pokes out left
                The card is absolutely positioned from sm up, so the photo sets the
                column height and the hero fits in one screen. */}
            <Reveal delay={250} className="lg:col-span-5">
              <div className="relative sm:mb-10 lg:mb-0">
                <div className="-mx-4 sm:mx-0 lg:ml-14">
                  <ImageSlot
                    image={IMAGES.hero}
                    aspect="aspect-[16/10] sm:aspect-[16/9] lg:aspect-[3/2]"
                    sizes="(min-width: 1024px) 34vw, 100vw"
                    objectPosition="30% 55%"
                    priority
                  />
                </div>
                {/* lg: back in normal flow, overlapping only the photo's bottom strip */}
                <div className="relative -mx-4 -mt-10 bg-brand px-6 py-8 text-paper shadow-2xl shadow-brand/25 sm:absolute sm:-bottom-10 sm:left-8 sm:mx-0 sm:mt-0 sm:w-[min(26rem,62%)] sm:p-8 lg:relative lg:bottom-auto lg:left-auto lg:-mt-14 lg:mr-14 lg:w-auto lg:px-7 lg:py-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/70">Our service rule</p>
                  <ol className="mt-5 divide-y divide-paper/15 lg:mt-3">
                    {["Inspect first.", "Explain scope.", "Confirm price.", "Check the result."].map((line, i) => (
                      <li key={line} className="grid grid-cols-[auto_1fr] items-baseline gap-5 py-4 first:pt-0 last:pb-0 sm:py-3 lg:gap-4 lg:py-2">
                        <span className="font-mono text-sm text-paper/55 lg:text-xs">0{i + 1}</span>
                        <span className="font-display text-2xl font-semibold tracking-tight sm:text-[1.6rem] lg:text-xl">{line}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. PILLARS --------------------------------------------------- */}
        <Reveal as="section" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="max-w-xl">
            <p className="eyebrow">One brand, three pillars</p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-display text-ink sm:text-4xl">
              A connected care brand.
            </h2>
          </div>

          <SwipeRail
            label="Spinning Top's three pillars"
            trackClassName="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-px sm:overflow-visible sm:border sm:border-ink/10 sm:bg-ink/10 sm:px-0"
          >
            {PILLARS.map((p, i) => (
              <Link
                key={p.no}
                href={p.href}
                aria-label={`${p.title} — ${i + 1} of ${PILLARS.length}`}
                className="group relative isolate flex w-[84%] shrink-0 snap-start flex-col overflow-hidden border border-ink/10 bg-paper outline-none sm:w-auto sm:border-0"
              >
                <ImageSlot
                  image={p.image}
                  aspect="aspect-[16/10] sm:aspect-[4/3]"
                  sizes="(min-width: 640px) 33vw, 100vw"
                  zoomOnHover
                />
                <div className="flex flex-1 flex-col p-5 sm:p-8">
                {/* Blue panel that sweeps up from the bottom on hover / focus */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-brand transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none"
                />
                {/* Oversized ghost number drifting in behind the content */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-6 -right-2 -z-10 font-display text-[7rem] font-bold leading-none text-paper/0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2 group-hover:text-paper/10 group-focus-visible:text-paper/10 motion-reduce:transition-none"
                >
                  {p.no}
                </span>

                <span className="font-mono text-xs text-ink/40 transition-colors duration-300 group-hover:text-paper/60 group-focus-visible:text-paper/60">
                  {p.no}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink transition-colors duration-300 sm:mt-6 group-hover:text-paper group-focus-visible:text-paper">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60 transition-colors duration-300 group-hover:text-paper/80 group-focus-visible:text-paper/80">
                  {p.desc}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 self-start font-mono text-[11px] sm:mt-8 font-bold uppercase tracking-wider text-ink/45 transition-colors duration-300 group-hover:text-paper group-focus-visible:text-paper">
                  <span className="relative">
                    Learn more
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 delay-100 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    />
                  </span>
                  <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5" />
                </span>
                </div>
              </Link>
            ))}
          </SwipeRail>
        </Reveal>

        {/* 2b. HOW IT WORKS -------------------------------------------- */}
        <section id="how" className="scroll-mt-20 border-t border-ink/10">
          <Reveal className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
            <div className="max-w-xl">
              <p className="eyebrow">How it works</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-display text-ink sm:text-4xl">
                Simple, from start to finish.
              </h2>
            </div>
            {/* Mobile: sticky stacking cards — each step slides up over the previous
                one and peels back off when scrolling up. sm+: plain 3-column row. */}
            <ol className="mt-12 grid sm:grid-cols-3 sm:gap-8">
              {HOW_STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="sticky top-[5.5rem] min-h-[10rem] border-t border-ink/10 bg-paper pb-10 pt-6 shadow-[0_-8px_16px_-14px_rgba(49,49,49,0.18)] first:shadow-none sm:static sm:min-h-0 sm:pb-0 sm:shadow-none"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-semibold text-paper">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{s.desc}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* 3. SERVICES -------------------------------------------------- */}
        <section id="services" className="scroll-mt-20 border-t border-ink/10">
          <Reveal className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
            {/* Header row: title left, action right */}
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <div>
                <p className="eyebrow">Care services</p>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-display text-ink sm:text-4xl">
                  Everyday, garment &amp; home care.
                </h2>
              </div>
              <ExternalCta className={textLink}>
                Ask about availability
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ExternalCta>
            </div>

            {/* lg: photo + 3×2 tiles at equal height. Below lg: tiles only (2 cols mobile, 3 cols tablet). */}
            <div className="mt-10 grid gap-3 lg:grid-cols-12 lg:gap-6">
              <div className="hidden lg:col-span-5 lg:block">
                <ImageSlot
                  image={IMAGES.services}
                  aspect="h-full min-h-[22rem]"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </div>

              {/* Mobile: compact centred category tiles (tint, icon on top, no arrow).
                  sm+: outlined cards with icon top-left and an arrow. */}
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:col-span-7 lg:grid-rows-2">
                {SERVICES.map((s) => (
                  <li key={s.title}>
                    <Link
                      href={`/services/${s.icon}`}
                      className="group flex h-full flex-col items-center justify-start gap-3 bg-tint px-3 pb-4 pt-5 text-center transition-all duration-300 active:scale-[0.98] sm:min-h-[8.5rem] sm:items-stretch sm:justify-between sm:gap-6 sm:border sm:border-ink/10 sm:bg-paper sm:p-5 sm:text-left sm:hover:-translate-y-0.5 sm:hover:border-brand sm:hover:shadow-lg sm:hover:shadow-brand/10"
                    >
                      <span className="grid h-12 w-12 place-items-center bg-paper text-ink shadow-sm shadow-ink/10 transition-colors duration-300 group-hover:bg-ink group-hover:text-paper sm:h-10 sm:w-10 sm:bg-tint sm:shadow-none">
                        <ServiceIcon name={s.icon} className="h-[22px] w-[22px] sm:h-5 sm:w-5" />
                      </span>
                      <span className="flex min-h-[2.25rem] items-start justify-center gap-2 sm:min-h-0 sm:items-end sm:justify-between">
                        <h3 className="font-display text-[13px] font-semibold leading-snug tracking-tight text-ink sm:text-base">
                          {s.title}
                        </h3>
                        <ArrowIcon className="hidden h-4 w-4 shrink-0 text-ink/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand sm:block" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        {/* 4. SHOP + ACADEMY ------------------------------------------- */}
        <section className="border-t border-ink/10">
          <div className="mx-auto grid max-w-7xl px-4 sm:px-6 md:grid-cols-2">
            <Reveal id="shop" className="scroll-mt-20 py-20 md:border-r md:border-ink/10 md:py-24 md:pr-12">
              <ImageSlot
                image={IMAGES.shop}
                aspect="aspect-[3/2]"
                sizes="(min-width: 768px) 50vw, 100vw"
                className="mb-10"
              />
              <p className="eyebrow">Product shop</p>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-display text-ink sm:text-3xl">
                Laundry &amp; hygiene essentials.
              </h2>
              <Link href="/shop" className={`${textLink} mt-6`}>
                Shop approved products
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>

            <Reveal
              id="academy"
              delay={150}
              className="scroll-mt-20 border-t border-ink/10 py-20 md:border-t-0 md:py-24 md:pl-12"
            >
              <ImageSlot
                image={IMAGES.academy}
                aspect="aspect-[3/2]"
                sizes="(min-width: 768px) 50vw, 100vw"
                className="mb-10"
              />
              <p className="eyebrow">Training Academy</p>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-display text-ink sm:text-3xl">
                Learn professional fabric care.
              </h2>
              <ExternalCta className={`${textLink} mt-6`}>
                Enquire about the next intake
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ExternalCta>
            </Reveal>
          </div>
        </section>

        {/* 5. CORPORATE ------------------------------------------------- */}
        <section id="corporate" className="scroll-mt-20 bg-tint">
          <Reveal className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:gap-16">
            <div>
              <p className="eyebrow">For organisations</p>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-display text-ink sm:text-3xl">
                Corporate laundry &amp; cleaning.
              </h2>
              <p className="mt-4 text-sm text-ink/60">Hotels, schools, offices and healthcare.</p>
              <ExternalCta className="btn-ink mt-8">
                Request a corporate quote <ArrowIcon />
              </ExternalCta>
            </div>
            <ImageSlot
              image={IMAGES.corporate}
              aspect="aspect-[4/3]"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="bg-paper"
            />
          </Reveal>
        </section>

        {/* 5b. VISIT US ------------------------------------------------- */}
        <section id="visit" className="scroll-mt-20">
          <Reveal className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
            <div className="max-w-xl">
              <p className="eyebrow">Visit us</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-display text-ink sm:text-4xl">
                Two outlets in Ibadan.
              </h2>
            </div>

            <div className="mt-12 grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-2">
              {BRANCHES.map((b) => (
                <article key={b.id} className="flex flex-col bg-paper p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-ink">{b.name}</h3>
                    {b.hours && <OpenStatus hours={b.hours} />}
                  </div>

                  <address className="mt-4 flex gap-3 text-sm not-italic leading-relaxed text-ink/65">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21z" />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                    <span>
                      {b.addressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </address>

                  {b.hours ? (
                    <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10 text-sm">
                      {b.hours.map((h) => (
                        <div key={h.days} className="flex items-center justify-between gap-4 py-2.5">
                          <dt className="text-ink/65">{h.days}</dt>
                          <dd className={h.opens ? "font-medium text-ink" : "text-ink/45"}>{h.time}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="mt-6 border-y border-ink/10 py-3 text-sm text-ink/55">
                      Hours: please enquire before visiting.
                    </p>
                  )}

                  <a
                    href={b.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${textLink} mt-6 self-start`}
                  >
                    Get directions
                    <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

      </main>

      <SiteFooter />
      <FloatingActions landing />
    </div>
  );
}
