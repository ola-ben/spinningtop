"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ImageSlot from "@/components/ImageSlot";
import ShopChrome from "@/components/shop/ShopChrome";
import ProductRail from "@/components/shop/ProductRail";
import { PhoneIcon } from "@/components/shop/ShopIcons";
import { PHONE_DISPLAY, PHONE_E164 } from "@/lib/site";
import { PRODUCTS } from "@/lib/shop-data";
import { SERVICE_PRICE_LABEL, type Service } from "@/lib/services-data";
import { QuoteButton, ServiceMini, serviceScope } from "./ServiceCard";

const STEPS = ["Inspect first", "Explain scope", "Confirm price", "Check the result"];

/* /services/[id] — same layout and behaviour as a product page:
   photo + summary, details, swipeable "Other services", and on mobile a
   sticky bar (call + request a quote) that stops at the footer. */
export default function ServiceView({
  service: s,
  services,
  others,
}: {
  service: Service;
  services: Service[];
  others: Service[];
}) {
  const [query, setQuery] = useState("");
  const scope = useMemo(() => serviceScope(services), [services]);

  return (
    <ShopChrome products={PRODUCTS} query={query} onQuery={setQuery} navigate scope={scope}>
      <main className="bg-ink/[0.03] md:pb-16">
        <div className="mx-auto max-w-7xl sm:px-6">
          <nav aria-label="Breadcrumb" className="px-4 py-3 text-xs text-ink/55 sm:px-0">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="text-ink transition-colors hover:text-brand">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">&gt;</li>
              <li>
                <Link href="/services" className="text-ink transition-colors hover:text-brand">
                  Services
                </Link>
              </li>
              <li aria-hidden="true">&gt;</li>
              <li aria-current="page" className="truncate">
                {s.name}
              </li>
            </ol>
          </nav>

          {/* Summary */}
          <section className="grid gap-px bg-ink/10 md:grid-cols-2">
            <div className="bg-paper">
              <ImageSlot
                image={{ src: s.image.src, alt: s.name, shot: s.name }}
                aspect="aspect-[4/3] md:aspect-square"
                sizes="(min-width: 768px) 50vw, 100vw"
                objectPosition={s.image.position}
                priority
              />
            </div>

            <div className="flex flex-col bg-paper p-4 sm:p-8">
              <p className="eyebrow">{s.category}</p>
              <h1 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{s.name}</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.summary}</p>

              <p className="mt-6 font-display text-xl font-bold">{SERVICE_PRICE_LABEL}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Available
              </p>

              {/* md+: inline buttons. Mobile uses the sticky bottom bar. */}
              <div className="mt-8 hidden flex-col gap-3 border-t border-ink/10 pt-6 md:flex">
                <QuoteButton service={s} />
                <a
                  href={`tel:${PHONE_E164}`}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 py-3.5 text-sm font-bold text-ink transition-colors hover:border-ink/40 hover:bg-ink/[0.04]"
                >
                  <PhoneIcon className="h-5 w-5" />
                  Call {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="mt-2 bg-paper p-4 sm:mt-4 sm:p-8">
            <h2 className="font-display text-lg font-semibold tracking-tight">Service details</h2>
            <dl className="mt-4 divide-y divide-ink/10 border-t border-ink/10 text-sm">
              <Row label="What's included">
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {s.includes.map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-brand" aria-hidden="true" />
                      {i}
                    </li>
                  ))}
                </ul>
              </Row>
              <Row label="How it works">
                <ol className="flex flex-wrap gap-2">
                  {STEPS.map((step, i) => (
                    <li key={step} className="inline-flex items-center gap-2 rounded-full bg-tint px-3 py-1.5 text-xs font-medium text-ink">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-paper">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </Row>
              <Row label="Good to know">{s.note}</Row>
              <Row label="Category">{s.category}</Row>
            </dl>
          </section>

          {others.length > 0 && (
            <ProductRail
              title="Other services"
              seeAllHref="/services"
              tiles={others.map((o) => ({ key: o.id, node: <ServiceMini service={o} /> }))}
            />
          )}
        </div>

        {/* Mobile bar: call + request a quote — sticky until the footer */}
        <div className="sticky bottom-0 z-30 mt-4 flex items-center gap-3 border-t border-ink/10 bg-paper px-4 py-3 shadow-[0_-4px_16px_rgba(49,49,49,0.08)] md:hidden">
          <a
            href={`tel:${PHONE_E164}`}
            aria-label={`Call Spinning Top on ${PHONE_DISPLAY}`}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-brand text-brand transition-colors active:bg-tint"
          >
            <PhoneIcon className="h-5 w-5" />
          </a>
          <div className="min-w-0 flex-1">
            <QuoteButton service={s} />
          </div>
        </div>
      </main>
    </ShopChrome>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="font-semibold text-ink">{label}</dt>
      <dd className="leading-relaxed text-ink/70">{children}</dd>
    </div>
  );
}
