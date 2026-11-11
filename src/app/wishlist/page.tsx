import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import WishlistView from "@/components/shop/WishlistView";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import { PRODUCTS } from "@/lib/shop-data";
import { getShopSettings } from "@/lib/shop-settings";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: true },
};

export default async function WishlistPage() {
  // Follows the same admin switch as /shop.
  const { showProducts } = await getShopSettings();
  if (!showProducts) return <ComingSoon page="shop" />;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <WishlistView products={PRODUCTS} />
      <SiteFooter />
      <FloatingActions quoteBar={false} />
    </div>
  );
}
