import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceView from "@/components/services/ServiceView";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import { SERVICES } from "@/lib/services-data";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ id: s.id }));
}

const findService = (id: string) => SERVICES.find((s) => s.id === id);

export async function generateMetadata({ params }: PageProps<"/services/[id]">): Promise<Metadata> {
  const { id } = await params;
  const service = findService(id);
  if (!service) return {};
  return {
    title: service.name,
    description: service.summary,
    alternates: { canonical: `/services/${service.id}` },
  };
}

/* Same structure as product pages: the id is read inside <Suspense> so
   taps open the page instantly with a skeleton. */
export default function ServicePage({ params }: PageProps<"/services/[id]">) {
  return (
    <Suspense fallback={<ServiceSkeleton />}>
      <ServiceContent params={params} />
    </Suspense>
  );
}

function ServiceSkeleton() {
  return (
    <div className="min-h-screen bg-ink/[0.03]" aria-busy="true" aria-label="Loading service">
      <div className="h-[120px] border-b border-ink/10 bg-paper md:h-[68px]" />
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-3 sm:px-6">
        <div className="h-3 w-40 bg-ink/10" />
        <div className="mt-3 grid gap-px md:grid-cols-2">
          <div className="aspect-[4/3] bg-ink/[0.07] md:aspect-square" />
          <div className="space-y-4 bg-paper p-5 sm:p-8">
            <div className="h-3 w-24 bg-ink/10" />
            <div className="h-7 w-2/3 bg-ink/10" />
            <div className="h-6 w-40 bg-ink/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ServiceContent({ params }: { params: PageProps<"/services/[id]">["params"] }) {
  const { id } = await params;
  const service = findService(id);
  if (!service) notFound();

  // Same category first, then the rest.
  const others = [
    ...SERVICES.filter((s) => s.id !== service.id && s.category === service.category),
    ...SERVICES.filter((s) => s.id !== service.id && s.category !== service.category),
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <ServiceView service={service} services={SERVICES} others={others} />
      <SiteFooter />
      <FloatingActions quoteBar={false} />
    </div>
  );
}
