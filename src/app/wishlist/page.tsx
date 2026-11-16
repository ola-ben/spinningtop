import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import WishlistView from "@/components/shop/WishlistView";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import { getProducts } from "@/lib/catalogue";
import ShopGate from "@/components/shop/ShopGate";
import { getShopSettings } from "@/lib/shop-settings";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: true },
};

export default async function WishlistPage() {
  // Follows the same admin switch as /shop.
  const [{ showProducts }, products] = await Promise.all([getShopSettings(), getProducts()]);

  return (
    <ShopGate initialOn={showProducts} off={<ComingSoon page="shop" />}>
      <div className="min-h-screen bg-paper text-ink">
        <WishlistView products={products} />
        <SiteFooter />
        <FloatingActions quoteBar={false} />
      </div>
    </ShopGate>
  );
}
