import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import ShopBrowser from "@/components/ShopBrowser";
import { PRODUCTS } from "@/lib/shop-data";

/* /shop when the admin switch is on. Uses its own shop header
   (in ShopBrowser) instead of the main site header. */
export default function ShopCatalogue() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <ShopBrowser products={PRODUCTS} />
      <SiteFooter />
      <FloatingActions quoteBar={false} />
    </div>
  );
}
