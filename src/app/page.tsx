import Reveal from "@/components/Reveal";
import RotatingWord from "@/components/RotatingWord";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ArrowIcon from "@/components/ArrowIcon";
import ImageSlot from "@/components/ImageSlot";
import ServiceIcon, { type ServiceIconName } from "@/components/ServiceIcon";
import { LINK_HUB, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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
    desc: "Laundry, wet & dry cleaning, repairs, upholstery & rugs, and pest control.",
    href: "#services",
    image: IMAGES.pillarServices,
  },
  {
    no: "02",
    title: "Product Shop",
    desc: "Laundry, hygiene and household products for individual and business buyers.",
    href: "#shop",
    image: IMAGES.pillarShop,
  },
  {
    no: "03",
    title: "Training Academy",
    desc: "Learning programmes in fabric care, service operations and related skills.",
    href: "#academy",
    image: IMAGES.pillarAcademy,
  },
];

/* Deliberately no pickup/delivery promise — Brand Book p.15 says not to
   advertise booking or logistics until they are operational. */
const HOW_STEPS = [
  {
    title: "Tell us what you need",
    desc: "Bring your items to a branch or send us an enquiry describing the service you need.",
  },
  {
    title: "We inspect & quote",
    desc: "We check each item and confirm the scope, price and timeline before any work begins.",
  },
  {
    title: "Collect when it’s ready",
    desc: "Every job is quality-checked before handover, and we let you know early if anything changes.",
  },
];

const SERVICES: { title: string; desc: string; icon: ServiceIconName }[] = [
  { title: "Laundry", desc: "Everyday and household washable items cleaned and neatly finished.", icon: "laundry" },
  { title: "Wet & Dry Cleaning", desc: "Professional care for suitable garments, textiles and delicate items.", icon: "cleaning" },
  { title: "Tailor Repairs & Alterations", desc: "Repairs and fit adjustments that give your favourite items more life.", icon: "tailor" },
  { title: "Shoe Repair / Cobbler", desc: "Care, selected repairs and restoration for appropriate footwear.", icon: "shoe" },
  { title: "Upholstery & Rug Cleaning", desc: "Cleaning support for selected sofas, chairs, rugs and furnishings.", icon: "upholstery" },
  { title: "Pest Control", desc: "Assessment-led pest management for residential or commercial premises.", icon: "pest" },
];

/* Structured data for search engines (schema.org). Address, phone and
   opening hours are left out until the business confirms them — add
   `address`, `telephone` and `openingHoursSpecification` here then. */
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
  areaServed: { "@type": "Country", name: "Nigeria" },
  sameAs: [LINK_HUB],
  knowsAbout: SERVICES.map((s) => s.title),
};

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
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[28px] border-brand/[0.06] sm:h-[28rem] sm:w-[28rem]" />
            <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full border border-brand/10" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-12 lg:pb-28 lg:pt-24">
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
                Comprehensive garment and home care, laundry and hygiene products, and practical industry training —
                from one trusted brand.
              </Reveal>

              <Reveal delay={300} className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                <ExternalCta className="btn-pill">
                  Request a quote <ArrowIcon />
                </ExternalCta>
                <a href="#services" className="btn-pill-ghost">
                  Explore services
                </a>
              </Reveal>

              <Reveal delay={400} className="mt-12 grid max-w-xl grid-cols-3 gap-3 border-t border-ink/15 pt-8 sm:gap-10">
                <div className="min-w-0">
                  <p className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">7</p>
                  <p className="mt-1 text-[11px] font-medium leading-snug text-ink/60 sm:text-sm">Business areas</p>
                </div>
                <div className="min-w-0">
                  <p className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">3</p>
                  <p className="mt-1 text-[11px] font-medium leading-snug text-ink/60 sm:text-sm">Services · Shop · Academy</p>
                </div>
                <div className="min-w-0">
                  <p className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">1</p>
                  <p className="mt-1 text-[11px] font-medium leading-snug text-ink/60 sm:text-sm">Trusted brand</p>
                </div>
              </Reveal>
            </div>

            {/* Service rule card */}
            <Reveal delay={250} className="lg:col-span-5">
              <div className="relative -mx-4 bg-brand px-6 py-8 text-paper shadow-2xl shadow-brand/25 sm:mx-0 sm:p-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/70">Our service rule</p>
                <ol className="mt-6 divide-y divide-paper/15">
                  {["Inspect first.", "Explain scope.", "Confirm price.", "Check the result."].map((line, i) => (
                    <li key={line} className="grid grid-cols-[auto_1fr] items-baseline gap-5 py-4 first:pt-0 last:pb-0">
                      <span className="font-mono text-sm text-paper/55">0{i + 1}</span>
                      <span className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{line}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-8 border-t border-paper/15 pt-6 text-sm leading-relaxed text-paper/80">
                  Careful service. Clear communication. Everyday convenience.
                </p>
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

          <div className="mt-12 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3">
            {PILLARS.map((p) => (
              <a
                key={p.no}
                href={p.href}
                className="group relative isolate flex flex-col overflow-hidden bg-paper outline-none"
              >
                <ImageSlot
                  image={p.image}
                  aspect="aspect-[4/3]"
                  sizes="(min-width: 640px) 33vw, 100vw"
                  zoomOnHover
                />
                <div className="flex flex-1 flex-col p-6 sm:p-8">
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
                <h3 className="mt-6 font-display text-lg font-semibold tracking-tight text-ink transition-colors duration-300 group-hover:text-paper group-focus-visible:text-paper">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60 transition-colors duration-300 group-hover:text-paper/80 group-focus-visible:text-paper/80">
                  {p.desc}
                </p>
                <span className="mt-8 inline-flex items-center gap-1.5 self-start font-mono text-[11px] font-bold uppercase tracking-wider text-ink/45 transition-colors duration-300 group-hover:text-paper group-focus-visible:text-paper">
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
              </a>
            ))}
          </div>
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
            <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {HOW_STEPS.map((s, i) => (
                <li key={s.title} className="border-t border-ink/10 pt-6">
                  <span className="font-mono text-xs text-brand">0{i + 1}</span>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{s.desc}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* 3. SERVICES -------------------------------------------------- */}
        <section id="services" className="scroll-mt-20 border-t border-ink/10">
          <Reveal className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Care services</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-display text-ink sm:text-4xl">
                Everyday, garment &amp; home care.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
                Every item is inspected before we quote, and we&rsquo;ll always explain the scope and any limitations up
                front.
              </p>
              <ExternalCta className={`${textLink} mt-8`}>
                Ask about availability
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ExternalCta>
              <ImageSlot
                image={IMAGES.services}
                aspect="aspect-[16/10] lg:aspect-[4/5]"
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="mt-10"
              />
            </div>

            <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
              {SERVICES.map((s) => (
                <li key={s.title} className="flex gap-4 border-t border-ink/10 py-6 sm:gap-3">
                  {/* Service icon — full size on mobile, compact from tablet up */}
                  <span className="grid h-9 w-9 shrink-0 place-items-center bg-tint text-brand sm:mt-px sm:h-6 sm:w-6">
                    <ServiceIcon name={s.icon} className="h-[18px] w-[18px] sm:h-3.5 sm:w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold tracking-tight text-ink">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
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
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60">
                Detergents, fabric-care agents, cleaning tools, disinfectants and household essentials — with clear usage
                information, for homes and businesses.
              </p>
              <ExternalCta className={`${textLink} mt-8`}>
                Shop approved products
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ExternalCta>
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
                Learn the techniques behind professional care.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60">
                Structured learning and supervised practice in laundry operations, wet &amp; dry cleaning, stain
                treatment, fabric care, customer service and safety.
              </p>
              <ExternalCta className={`${textLink} mt-8`}>
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
                A clear service plan for your organisation.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink/60">
                Hotels, schools, offices, healthcare facilities and property managers — tell us what you need and
                we&rsquo;ll assess the work and prepare a clear quotation.
              </p>
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

        {/* 6. CLOSING --------------------------------------------------- */}
        <Reveal as="section" className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-display text-ink sm:text-4xl">
            Better care. Easier living. <span className="text-brand">Brighter futures.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/60">
            Tell us what you need — we&rsquo;ll inspect, explain the scope and confirm the price.
          </p>
          <ExternalCta className="btn-pill mt-8">
            Request a quote <ArrowIcon />
          </ExternalCta>
        </Reveal>
      </main>

      <SiteFooter />
    </div>
  );
}
