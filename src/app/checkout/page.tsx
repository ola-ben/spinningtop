import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import SiteFooter from "@/components/SiteFooter";
import ShopGate from "@/components/shop/ShopGate";
import CheckoutView from "@/components/shop/CheckoutView";
import { getProducts } from "@/lib/catalogue";
import { getShopSettings } from "@/lib/shop-settings";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [{ showProducts }, products] = await Promise.all([getShopSettings(), getProducts()]);
  return (
    <ShopGate initialOn={showProducts} off={<ComingSoon page="shop" />}>
      <div className="min-h-screen bg-paper text-ink">
        <CheckoutView products={products} />
        <SiteFooter />
      </div>
    </ShopGate>
  );
}
