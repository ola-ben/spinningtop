import type { Metadata } from "next";
import BookingView from "@/components/services/BookingView";
import SiteFooter from "@/components/SiteFooter";
import { getProducts, getServices } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Book a Service",
  description: "Request laundry, cleaning, repairs and home care services from Spinning Top in Ibadan.",
  alternates: { canonical: "/book" },
};

export default async function BookPage() {
  const [services, products] = await Promise.all([getServices(), getProducts()]);
  return (
    <div className="min-h-screen bg-paper text-ink">
      <BookingView services={services} products={products} />
      <SiteFooter />
    </div>
  );
}
