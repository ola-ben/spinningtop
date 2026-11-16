import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import ShopGate from "@/components/shop/ShopGate";
import { LiveProductPage } from "@/components/shop/LiveItemPages";
import { LIVE_ID } from "@/lib/catalogue-rows";
import { getProducts } from "@/lib/catalogue";
import { getShopSettings } from "@/lib/shop-settings";

/* One page per product that exists at build time, plus /shop/_live/ which
   shows products added later in /admin (Apache sends unknown /shop/<id>/
   addresses there — see .htaccess written by scripts/package-static.mjs). */
export async function generateStaticParams() {
  const products = await getProducts();
  return [...products.map((p) => ({ id: p.id })), { id: LIVE_ID }];
}

export async function generateMetadata({ params }: PageProps<"/shop/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = (await getProducts()).find((p) => p.id === id);
  if (!product) return { title: "Shop", robots: { index: false, follow: true } };
  return {
    title: `${product.name} (${product.size})`,
    description: product.description,
    alternates: { canonical: `/shop/${product.id}` },
    // Kept out of search results while the shop is in preview.
    robots: { index: false, follow: true },
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[id]">) {
  const { id } = await params;
  const [{ showProducts }, products] = await Promise.all([getShopSettings(), getProducts()]);

  return (
    <ShopGate initialOn={showProducts} off={<ComingSoon page="shop" />}>
      <div className="min-h-screen bg-paper text-ink">
        <LiveProductPage id={id === LIVE_ID ? undefined : id} products={products} />
        <SiteFooter />
        <FloatingActions quoteBar={false} />
      </div>
    </ShopGate>
  );
}
