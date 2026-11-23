import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import { LEGAL_TAGLINE, type LegalDoc } from "@/lib/legal";

/* Shared layout for /terms and /privacy: homepage header, document title,
   contents list, numbered sections, contact details. */

const slug = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/^(\d+)\.\s*/, "s$1-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "");

/** Highlights [BRACKETED] placeholders and links plain URLs. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\]|https:\/\/[^\s]+?(?=\.?(?:\s|$)))/g).map((part, i) => {
        if (/^\[[^\]]+\]$/.test(part)) {
          return (
            <mark key={i} className="rounded bg-brand/[0.08] px-0.5 font-medium text-brand">
              {part}
            </mark>
          );
        }
        if (/^https:\/\//.test(part)) {
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2">
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}

export default function LegalPage({ doc, other }: { doc: LegalDoc; other: { href: string; label: string } }) {
  const headings = [...doc.sections.map((s) => s.heading), doc.contact.heading];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main>
        {/* Title */}
        <section className="border-b border-ink/10 bg-tint">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{LEGAL_TAGLINE}</p>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-5xl">{doc.title}</h1>
            <p className="mt-3 text-sm text-ink/60 sm:text-base">{doc.subtitle}</p>
            {doc.draftNote && (
              <p className="mt-6 rounded-lg bg-paper/70 px-4 py-3 text-xs font-semibold leading-relaxed text-ink sm:text-sm">
                <Rich text={doc.draftNote} />
              </p>
            )}
            <p className="mt-4 flex flex-col gap-1 text-xs text-ink/55 sm:flex-row sm:flex-wrap sm:gap-x-3 sm:text-sm">
              {doc.meta.map((m, i) => (
                <span key={m} className="flex items-center gap-3">
                  {i > 0 && (
                    <span aria-hidden="true" className="hidden sm:inline">
                      |
                    </span>
                  )}
                  <Rich text={m} />
                </span>
              ))}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-12 lg:py-14">
          {/* Contents */}
          <nav aria-label="Contents" className="mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Contents</p>
              <ol className="mt-3 flex flex-col gap-1.5 border-l border-ink/10 text-sm">
                {headings.map((h) => (
                  <li key={h}>
                    <a href={`#${slug(h)}`} className="-ml-px block border-l border-transparent pl-3 text-ink/65 transition-colors hover:border-brand hover:text-brand">
                      {h}
                    </a>
                  </li>
                ))}
              </ol>
              <Link href={other.href} className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">
                {other.label} →
              </Link>
            </div>
          </nav>

          {/* Document */}
          <article className="max-w-3xl">
            {doc.sections.map((s) => (
              <section key={s.heading} id={slug(s.heading)} className="scroll-mt-24 border-b border-ink/[0.08] pb-8 pt-2 [&:not(:first-child)]:pt-8">
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{s.heading}</h2>
                <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-ink/75">
                  {s.blocks.map((b, i) =>
                    b.type === "p" ? (
                      <p key={i}>
                        <Rich text={b.text} />
                      </p>
                    ) : (
                      <ul key={i} className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
                        {b.items.map((item) => (
                          <li key={item}>
                            <Rich text={item} />
                          </li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </section>
            ))}

            <section id={slug(doc.contact.heading)} className="scroll-mt-24 pt-8">
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{doc.contact.heading}</h2>
              {doc.contact.intro && (
                <p className="mt-4 text-[15px] leading-relaxed text-ink/75">
                  <Rich text={doc.contact.intro} />
                </p>
              )}
              <dl className="mt-5 flex flex-col gap-2 rounded-xl border border-ink/10 p-5 text-[15px]">
                {doc.contact.rows.map(([label, value]) => (
                  <div key={label} className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold text-ink">{label}:</dt>
                    <dd className="text-ink/75">
                      <Rich text={value} />
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm font-bold text-brand">{LEGAL_TAGLINE}</p>
            </section>
          </article>
        </div>
      </main>

      <SiteFooter />
      <FloatingActions quoteBar={false} />
    </div>
  );
}
