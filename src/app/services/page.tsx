import type { Metadata } from "next";
import ServicesBrowser from "@/components/services/ServicesBrowser";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import { getProducts, getServices } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Care Services",
  description:
    "Laundry, wet & dry cleaning, tailor repairs, shoe repair, upholstery & rug cleaning and pest control in Ibadan. Inspected and quoted before work begins.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [services, products] = await Promise.all([getServices(), getProducts()]);
  return (
    <div className="min-h-screen bg-paper text-ink">
      <ServicesBrowser services={services} products={products} />
      <SiteFooter />
      <FloatingActions quoteBar={false} />
    </div>
  );
}
