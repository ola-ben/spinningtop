import ComingSoon, { comingSoonMetadata } from "@/components/ComingSoon";
import ShopCatalogue from "@/components/ShopCatalogue";
import { getShopSettings } from "@/lib/shop-settings";

// Kept out of search results while the shop is in preview.
export const metadata = comingSoonMetadata("shop");

/* The admin switch (/admin) decides which version shows. */
export default async function Page() {
  const { showProducts } = await getShopSettings();
  return showProducts ? <ShopCatalogue /> : <ComingSoon page="shop" />;
}
