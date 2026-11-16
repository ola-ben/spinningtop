import Dashboard from "@/components/admin/Dashboard";
import { getProducts } from "@/lib/catalogue";
import { getShopSettings } from "@/lib/shop-settings";

// The admin layout's title template only applies to child routes, so set this one in full.
export const metadata = { title: { absolute: "Dashboard · Admin" } };

/* Built with the catalogue as it was at build time; the dashboard then loads
   the live numbers from Supabase in the browser. */
export default async function DashboardPage() {
  const [products, { showProducts }] = await Promise.all([getProducts(), getShopSettings()]);
  return <Dashboard initialProducts={products} initialShopOn={showProducts} />;
}
