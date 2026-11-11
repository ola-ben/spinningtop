import type { Metadata } from "next";
import ServicesBrowser from "@/components/services/ServicesBrowser";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import { SERVICES } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Care Services",
  description:
    "Laundry, wet & dry cleaning, tailor repairs, shoe repair, upholstery & rug cleaning and pest control in Ibadan. Inspected and quoted before work begins.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <ServicesBrowser services={SERVICES} />
      <SiteFooter />
      <FloatingActions quoteBar={false} />
    </div>
  );
}
