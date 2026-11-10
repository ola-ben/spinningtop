import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import ArrowIcon from "@/components/ArrowIcon";
import { COMING_SOON, QUOTE_LINK, type ComingSoonPage } from "@/lib/site";

/** Page metadata for a coming-soon route. Kept out of search results until the page is built. */
export function comingSoonMetadata(page: ComingSoonPage): Metadata {
  const { title, description } = COMING_SOON[page];
  return {
    title,
    description,
    alternates: { canonical: `/${page}` },
    robots: { index: false, follow: true },
  };
}

/** Placeholder page: same header, footer and look as the home page. */
export default function ComingSoon({ page }: { page: ComingSoonPage }) {
  const { eyebrow, title, description } = COMING_SOON[page];

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <section className="relative flex flex-1 overflow-hidden bg-tint">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[28px] border-brand/[0.06] sm:h-[28rem] sm:w-[28rem]" />
          </div>

          <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:py-32">
            <p className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/70 sm:text-[11px]">
              <span className="h-1.5 w-1.5 shrink-0 rotate-45 animate-pulse bg-brand" />
              {eyebrow}
            </p>

            <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl">
              {title}
            </h1>

            <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-brand px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-paper">
              Coming soon
            </p>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70 md:text-lg">{description}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/55">
              We&rsquo;re putting this page together. In the meantime, you can send us an enquiry or visit one of our
              outlets in Ibadan.
            </p>

            <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <a href={QUOTE_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill">
                Request a quote <ArrowIcon />
              </a>
              <Link href="/" className="btn-pill-ghost">
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <FloatingActions />
    </div>
  );
}
