import ComingSoon, { comingSoonMetadata } from "@/components/ComingSoon";
import ShopCatalogue from "@/components/ShopCatalogue";
import { getProducts } from "@/lib/catalogue";
import ShopGate from "@/components/shop/ShopGate";
import { getShopSettings } from "@/lib/shop-settings";

// Kept out of search results while the shop is in preview.
export const metadata = comingSoonMetadata("shop");

/* The admin switch (/admin) decides which version shows — checked again
   live in the browser, so it works without rebuilding. */
export default async function Page() {
  const [{ showProducts }, products] = await Promise.all([getShopSettings(), getProducts()]);
  return (
    <ShopGate initialOn={showProducts} off={<ComingSoon page="shop" />}>
      <ShopCatalogue products={products} />
    </ShopGate>
  );
}
