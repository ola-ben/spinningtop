import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ComingSoon from "@/components/ComingSoon";
import ProductView from "@/components/shop/ProductView";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import { PRODUCTS } from "@/lib/shop-data";
import { getShopSettings } from "@/lib/shop-settings";

// Every product page is built ahead of time; unknown ids hit notFound() below.
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export async function generateMetadata({ params }: PageProps<"/shop/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = findProduct(id);
  if (!product) return {};
  return {
    title: `${product.name} (${product.size})`,
    description: product.description,
    alternates: { canonical: `/shop/${product.id}` },
    // Kept out of search results while the shop is in preview.
    robots: { index: false, follow: true },
  };
}

/* The product id comes from the URL, so it's read inside <Suspense>:
   tapping a product opens the page instantly with a light skeleton,
   then the product fills in. */
export default function ProductPage({ params }: PageProps<"/shop/[id]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-ink/[0.03]" aria-busy="true" aria-label="Loading product">
      <div className="h-[120px] border-b border-ink/10 bg-paper md:h-[68px]" />
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-3 sm:px-6">
        <div className="h-3 w-40 bg-ink/10" />
        <div className="mt-3 grid gap-px md:grid-cols-2">
          <div className="aspect-[4/3] bg-ink/[0.07] md:aspect-square" />
          <div className="space-y-4 bg-paper p-5 sm:p-8">
            <div className="h-3 w-24 bg-ink/10" />
            <div className="h-7 w-2/3 bg-ink/10" />
            <div className="h-8 w-32 bg-ink/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ProductContent({ params }: { params: PageProps<"/shop/[id]">["params"] }) {
  const { id } = await params;
  const product = findProduct(id);
  if (!product) notFound();

  // Same admin switch as /shop.
  const { showProducts } = await getShopSettings();
  if (!showProducts) return <ComingSoon page="shop" />;

  // Same category first, then the rest (scrollable row).
  const related = [
    ...PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category),
    ...PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 8);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <ProductView product={product} products={PRODUCTS} related={related} />
      <SiteFooter />
      <FloatingActions quoteBar={false} />
    </div>
  );
}
