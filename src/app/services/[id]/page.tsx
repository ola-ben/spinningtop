import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import { LiveServicePage } from "@/components/shop/LiveItemPages";
import { LIVE_ID } from "@/lib/catalogue-rows";
import { getProducts, getServices } from "@/lib/catalogue";

/* One page per service that exists at build time, plus /services/_live/ which
   shows services added later in /admin (Apache sends unknown
   /services/<id>/ addresses there — see scripts/package-static.mjs). */
export async function generateStaticParams() {
  const services = await getServices();
  return [...services.map((s) => ({ id: s.id })), { id: LIVE_ID }];
}

export async function generateMetadata({ params }: PageProps<"/services/[id]">): Promise<Metadata> {
  const { id } = await params;
  const service = (await getServices()).find((s) => s.id === id);
  if (!service) return { title: "Care Services", robots: { index: false, follow: true } };
  return {
    title: service.name,
    description: service.summary,
    alternates: { canonical: `/services/${service.id}` },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[id]">) {
  const { id } = await params;
  const [services, products] = await Promise.all([getServices(), getProducts()]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <LiveServicePage id={id === LIVE_ID ? undefined : id} services={services} products={products} />
      <SiteFooter />
      <FloatingActions quoteBar={false} />
    </div>
  );
}
